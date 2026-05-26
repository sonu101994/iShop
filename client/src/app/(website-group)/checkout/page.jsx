"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CreditCard, MapPin, PackageCheck, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react";
import {
    addAddress,
    cancelPayment,
    createOrder,
    createPaymentOrder,
    deleteAddress,
    getAddresses,
    getCartItems,
    updateAddress,
    verifyPayment,
} from "@/library/api-call";
import { buildImageUrl } from "@/library/helper";
import { clearCart, getCartItemKey, getCartProductId, getCartSelectedColor, restoreCart, syncCart } from "@/redux/reducers/CartReducers";

const formatPrice = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const getPrice = (item) => Number(item.discounted_price || item.discount_price || item.price || item.unit_price || 0);

const emptyAddress = {
    name: "",
    mobile: "",
    pincode: "",
    address: "",
    locality: "",
    city: "",
    state: "",
    landmark: "",
    address_type: "home",
    is_default: true,
};

// load razorpay only when online payment is used
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (typeof window === "undefined") return resolve(false);
        if (window.Razorpay) return resolve(true);

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const token = useSelector((state) => state.user?.token);
    const user = useSelector((state) => state.user?.data);
    const cartItems = useSelector((state) => state.cart?.cartItems || []);

    // store checkout form data
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [addressForm, setAddressForm] = useState(emptyAddress);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [addressBusyId, setAddressBusyId] = useState("");

    useEffect(() => {
        let active = true;

        async function loadCheckoutData() {
            setLoadingData(true);

            if (!token) {
                // keep guest cart from local storage
                dispatch(restoreCart());
                if (active) setLoadingData(false);
                return;
            }

            // load cart and addresses together
            const [cartResponse, addressResponse] = await Promise.all([
                getCartItems(),
                getAddresses(),
            ]);

            if (!active) return;

            if (cartResponse.flag === 1) {
                dispatch(syncCart(cartResponse.cart || []));
            } else {
                toast.error(cartResponse.msg || "Could not load cart");
            }

            if (addressResponse.flag === 1) {
                const list = addressResponse.addresses || [];
                setAddresses(list);

                // select default address first
                const defaultAddress = list.find((item) => item.is_default) || list[0];
                setSelectedAddressId(defaultAddress?._id || "");
            }

            setLoadingData(false);
        }

        loadCheckoutData();

        return () => {
            active = false;
        };
    }, [token, dispatch]);

    const subtotal = useMemo(
        // calculate cart subtotal
        () => cartItems.reduce((total, item) => total + getPrice(item) * Number(item.quantity || 1), 0),
        [cartItems]
    );

    const totalQty = useMemo(
        // calculate total quantity
        () => cartItems.reduce((total, item) => total + Number(item.quantity || 1), 0),
        [cartItems]
    );

    const selectedAddress = addresses.find((item) => item._id === selectedAddressId);

    // show form when no saved address is selected
    const useNewAddress = !selectedAddressId;

    const handleAddressChange = (e) => {
        // update address form values
        const { name, value, type, checked } = e.target;
        setAddressForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const updateAddressList = (list = []) => {
        // keep selected address valid
        setAddresses(list);
        const selectedStillExists = list.find((address) => address._id === selectedAddressId);
        const defaultAddress = list.find((address) => address.is_default) || list[0];
        setSelectedAddressId(selectedStillExists?._id || defaultAddress?._id || "");
    };

    const handleSetDefaultAddress = async (addressId) => {
        if (!addressId) return;

        // show loading on selected address
        setAddressBusyId(addressId);
        const response = await updateAddress(addressId, { is_default: true });

        if (response.flag === 1) {
            updateAddressList(response.addresses || []);
            toast.success("Default address updated");
        } else {
            toast.error(response.msg || "Could not update address");
        }

        setAddressBusyId("");
    };

    const handleDeleteAddress = async (addressId) => {
        if (!addressId) return;

        // delete saved address
        setAddressBusyId(addressId);
        const response = await deleteAddress(addressId);

        if (response.flag === 1) {
            updateAddressList(response.addresses || []);
            toast.success(response.msg || "Address deleted");
        } else {
            toast.error(response.msg || "Could not delete address");
        }

        setAddressBusyId("");
    };

    const validateAddress = () => {
        // skip form check for saved address
        if (selectedAddress) return true;

        const required = ["name", "mobile", "pincode", "address", "locality", "city", "state"];
        const missing = required.find((key) => !String(addressForm[key] || "").trim());

        if (missing) {
            toast.error("Please fill complete delivery address");
            return false;
        }

        return true;
    };

    const buildOrderProducts = () =>
        // send only needed product data
        cartItems
            .map((item) => {
                const selectedColor = getCartSelectedColor(item);
                return {
                    product_id: getCartProductId(item),
                    qty: Number(item.quantity || 1),
                    color_id: selectedColor?._id || selectedColor?.color_id || item.color_id || null,
                };
            })
            .filter((item) => item.product_id);

    const getShippingAddress = async () => {
        if (selectedAddress) {
            // use selected saved address
            return {
                address_id: selectedAddress._id,
                shipping_address: selectedAddress,
            };
        }

        // save new address before order
        const response = await addAddress(addressForm);
        if (response.flag !== 1) {
            throw new Error(response.msg || "Could not save address");
        }

        if (response.addresses) updateAddressList(response.addresses);

        const savedAddress = response.address || addressForm;
        return {
            address_id: savedAddress._id,
            shipping_address: savedAddress,
        };
    };

    const finishOrder = (message = "Order placed successfully") => {
        // clear cart after success
        dispatch(clearCart());
        toast.success(message);
        router.push("/orders");
    };

    const handlePlaceOrder = async () => {
        if (!token) {
            toast.error("Please login to place order");
            router.push("/user/login");
            return;
        }

        if (!cartItems.length) {
            toast.error("Cart is empty");
            return;
        }

        if (!validateAddress()) return;

        const products = buildOrderProducts();
        if (!products.length) {
            toast.error("Cart product data missing");
            return;
        }

        setLoading(true);

        try {
            const addressPayload = await getShippingAddress();

            if (paymentMethod === "ONLINE") {
                // start online payment flow
                await handleOnlinePayment(products, addressPayload);
                return;
            }

            // create cod order directly
            const response = await createOrder({
                products,
                payment_method: "COD",
                ...addressPayload,
            });

            if (response.flag === 1) {
                finishOrder("Order placed successfully");
            } else {
                toast.error(response.msg || "Could not place order");
            }
        } catch (error) {
            toast.error(error.message || "Could not place order");
        } finally {
            setLoading(false);
        }
    };

    const handleOnlinePayment = async (products, addressPayload) => {
        // create payment order on backend
        const paymentResponse = await createPaymentOrder({
            products,
            payment_method: "ONLINE",
            ...addressPayload,
        });

        if (paymentResponse.flag !== 1) {
            toast.error(paymentResponse.msg || "Online payment is not available");
            return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
            toast.error("Payment checkout could not load");
            return;
        }

        const options = {
            key: paymentResponse.razorpay_key,
            amount: Math.round(Number(paymentResponse.amount || 0) * 100),
            currency: "INR",
            name: "iShop",
            description: "Order payment",
            order_id: paymentResponse.razorpay_order_id,
            prefill: {
                name: user?.name || addressPayload.shipping_address?.name || "",
                email: user?.email || "",
                contact: user?.phone || addressPayload.shipping_address?.mobile || "",
            },
            handler: async (razorpayResponse) => {
                // verify payment on server
                const verifyResponse = await verifyPayment({
                    ...razorpayResponse,
                    payment_session_id: paymentResponse.payment_session_id,
                });

                if (verifyResponse.flag === 1) {
                    finishOrder("Payment successful");
                } else {
                    toast.error(verifyResponse.msg || "Payment verification failed");
                }
            },
            modal: {
                ondismiss: async () => {
                    // cancel payment session if popup closes
                    await cancelPayment({
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        payment_session_id: paymentResponse.payment_session_id,
                    });
                    toast.info("Payment cancelled");
                },
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    if (!token) {
        return (
            <div className="bg-slate-50 py-16">
                <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-slate-700 shadow-sm">
                        <ShoppingCart size={26} />
                    </div>
                    <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">Login required</h1>
                    <p className="mt-3 text-slate-500">Please login before checkout so your address, order and payment can be saved.</p>
                    <Link href="/user/login" className="mt-7 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800">
                        Login to continue
                    </Link>
                </div>
            </div>
        );
    }

    if (loadingData) {
        return (
            <div className="bg-slate-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                        <div className="space-y-4">
                            <div className="h-60 animate-pulse rounded-2xl bg-white" />
                            <div className="h-44 animate-pulse rounded-2xl bg-white" />
                        </div>
                        <div className="h-96 animate-pulse rounded-2xl bg-white" />
                    </div>
                </div>
            </div>
        );
    }

    if (!cartItems.length) {
        return (
            <div className="bg-slate-50 py-16">
                <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-semibold text-slate-950">Cart is empty</h1>
                    <p className="mt-3 text-slate-500">Add products before checkout.</p>
                    <Link href="/products" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white">
                        Continue shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <p className="text-sm font-medium text-slate-500">Checkout</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Complete your order</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-5">
                        {/* delivery address area */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-950">Delivery address</h2>
                                    <p className="text-sm text-slate-500">Select default address, delete old address or add a new one.</p>
                                </div>
                            </div>

                            {addresses.length > 0 && (
                                <div className="mb-5 grid gap-3 md:grid-cols-2">
                                    {addresses.map((address) => (
                                        <div key={address._id} className={`rounded-2xl border p-4 ${selectedAddressId === address._id ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white"}`}>
                                            <label className="block cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="address_id"
                                                    checked={selectedAddressId === address._id}
                                                    onChange={() => setSelectedAddressId(address._id)}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-950">{address.name}</p>
                                                        <p className="mt-1 text-sm text-slate-600">{address.mobile}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        {address.is_default && <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs text-white">Default</span>}
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{address.address_type}</span>
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                                    {address.address}, {address.locality}, {address.city}, {address.state} - {address.pincode}
                                                </p>
                                            </label>
                                            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                                                {!address.is_default && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetDefaultAddress(address._id)}
                                                        disabled={addressBusyId === address._id}
                                                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 disabled:opacity-60"
                                                    >
                                                        Make default
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteAddress(address._id)}
                                                    disabled={addressBusyId === address._id}
                                                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-rose-200 hover:text-rose-600 disabled:opacity-60"
                                                >
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* select new address form */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAddressId("")}
                                        className={`rounded-2xl border p-4 text-left ${useNewAddress ? "border-slate-950 bg-slate-50" : "border-dashed border-slate-300 bg-white"}`}
                                    >
                                        <p className="font-semibold text-slate-950">Add new address</p>
                                        <p className="mt-1 text-sm text-slate-500">Save and use a new delivery address.</p>
                                    </button>
                                </div>
                            )}

                            {useNewAddress && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <input name="name" value={addressForm.name} onChange={handleAddressChange} placeholder="Full name" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                                    <input name="mobile" value={addressForm.mobile} onChange={handleAddressChange} placeholder="Mobile number" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                                    <input name="pincode" value={addressForm.pincode} onChange={handleAddressChange} placeholder="Pincode" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                                    <input name="locality" value={addressForm.locality} onChange={handleAddressChange} placeholder="Locality" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                                    <textarea name="address" value={addressForm.address} onChange={handleAddressChange} placeholder="Address" className="min-h-24 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400 md:col-span-2" />
                                    <input name="city" value={addressForm.city} onChange={handleAddressChange} placeholder="City" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                                    <input name="state" value={addressForm.state} onChange={handleAddressChange} placeholder="State" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                                    <input name="landmark" value={addressForm.landmark} onChange={handleAddressChange} placeholder="Landmark optional" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                                    <select name="address_type" value={addressForm.address_type} onChange={handleAddressChange} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400">
                                        <option value="home">Home</option>
                                        <option value="office">Office</option>
                                    </select>
                                    <label className="flex items-center gap-2 text-sm text-slate-600 md:col-span-2">
                                        <input type="checkbox" name="is_default" checked={Boolean(addressForm.is_default)} onChange={handleAddressChange} />
                                        Save as default address
                                    </label>
                                </div>
                            )}
                        </section>

                        {/* payment options */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700">
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-950">Payment method</h2>
                                    <p className="text-sm text-slate-500">COD works immediately. Online uses your Razorpay backend.</p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className={`cursor-pointer rounded-2xl border p-4 ${paymentMethod === "COD" ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white"}`}>
                                    <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="sr-only" />
                                    <p className="font-semibold text-slate-950">Cash on delivery</p>
                                    <p className="mt-1 text-sm text-slate-500">Place order now, pay on delivery.</p>
                                </label>

                                <label className={`cursor-pointer rounded-2xl border p-4 ${paymentMethod === "ONLINE" ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white"}`}>
                                    <input type="radio" name="payment" value="ONLINE" checked={paymentMethod === "ONLINE"} onChange={() => setPaymentMethod("ONLINE")} className="sr-only" />
                                    <p className="font-semibold text-slate-950">Online payment</p>
                                    <p className="mt-1 text-sm text-slate-500">Create Razorpay order and verify payment.</p>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* order summary */}
                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-20">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700">
                                <PackageCheck size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950">Order summary</h2>
                                <p className="text-sm text-slate-500">{cartItems.length} items, {totalQty} quantity</p>
                            </div>
                        </div>

                        <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
                            {cartItems.map((item) => {
                                // prepare cart item display data
                                const productId = getCartProductId(item);
                                const itemKey = getCartItemKey(item);
                                const selectedColor = getCartSelectedColor(item);
                                const image = buildImageUrl(item.image_path || "/images/products/main_images/", item.image_name);
                                const price = getPrice(item);

                                return (
                                    <div key={itemKey || productId} className="flex gap-3">
                                        <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                                            <img src={image} alt={item.name || "Product"} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-1 text-sm font-medium text-slate-950">{item.name || "Product"}</p>
                                            <p className="mt-1 text-xs text-slate-500">Qty {item.quantity} × {formatPrice(price)}</p>
                                            {selectedColor && (
                                                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                    <span className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: selectedColor.color_code || "#e2e8f0" }} />
                                                    {selectedColor.name}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-950">{formatPrice(price * Number(item.quantity || 1))}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-slate-950">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Delivery</span>
                                <span className="font-medium text-emerald-700">Free</span>
                            </div>
                            <div className="flex justify-between text-base font-semibold text-slate-950">
                                <span>Total</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                        </div>

                        {/* change button text by payment type */}
                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={loading || loadingData}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <ShieldCheck size={17} />
                            {loading ? "Processing..." : paymentMethod === "ONLINE" ? "Pay & place order" : "Place order"}
                        </button>

                        <Link href="/cart" className="mt-3 block rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-medium text-slate-700 hover:border-slate-400">
                            Back to cart
                        </Link>
                    </aside>
                </div>
            </div>
        </div>
    );
}