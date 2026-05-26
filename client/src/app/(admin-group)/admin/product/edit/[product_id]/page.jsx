"use client";

import { getBrand, getColors, getProduct } from "@/library/api-call";
import { apiClient, titleToSlug, getAuthHeader, buildImageUrl } from "@/library/helper";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function EditProductPage() {

  const router = useRouter();
  const params = useParams();

  const [data, setData] = useState({
    product: null,
    imageUrl: null,
  });

  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);

  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  const skuRef = useRef(null);
  const nameRef = useRef(null);
  const slugRef = useRef(null);

  const originalPriceRef = useRef(null);
  const discountedPriceRef = useRef(null);

  const discountPercentageRef = useRef(null);

  const descriptionRef = useRef(null);

  const brandRef = useRef(null);

  const imageRef = useRef(null);

  // fetch product details
  const fetchProduct = async () => {

    const { products, image_path } = await getProduct({
      id: params.product_id,
    });

    const product = products[0];

    setData({
      product,
      imageUrl: image_path,
    });

    setSelectedBrand(
      product?.brand_id?._id || ""
    );

    setSelectedColors(
      product?.color_ids?.map((item) => item._id) || []
    );

  };

  // fetch brands
  const fetchBrands = async () => {

    const { brands } = await getBrand();

    setBrands(brands || []);

  };

  // fetch colors
  const fetchColors = async () => {

    const { colors } = await getColors();

    setColors(colors || []);

  };

  useEffect(() => {

    if (params.product_id) {

      fetchProduct();

      fetchBrands();

      fetchColors();

    }

  }, [params.product_id]);

  // auto generate slug
  const nameChangeHandler = () => {

    const slug = titleToSlug(nameRef.current.value);

    slugRef.current.value = slug;

  };

  // image preview
  const imagePreviewHandler = (e) => {

    const file = e.target.files[0];

    if (file) {

      setPreview(URL.createObjectURL(file));

      setFileName(file.name);

    }

  };

  // remove image
  const removeImageHandler = () => {

    setPreview(null);

    setFileName("");

    if (imageRef.current) {

      imageRef.current.value = "";

    }

  };

  // color handler
  const colorHandler = (id) => {

    if (selectedColors.includes(id)) {

      setSelectedColors(
        selectedColors.filter((item) => item !== id)
      );

    } else {

      setSelectedColors([
        ...selectedColors,
        id,
      ]);

    }

  };

  // update product
  const submitHandler = async (e) => {

    e.preventDefault();

    if (
      nameRef.current.value.trim() === "" ||
      slugRef.current.value.trim() === "" ||
      skuRef.current.value.trim() === ""
    ) {

      toast.warning("Please fill all required fields");

      return;

    }

    try {

      const image_file = imageRef.current.files[0];

      const formData = new FormData();

      formData.append("sku_id", skuRef.current.value);

      formData.append("name", nameRef.current.value);

      formData.append("slug", slugRef.current.value);

      formData.append(
        "original_price",
        originalPriceRef.current.value
      );

      formData.append(
        "discounted_price",
        discountedPriceRef.current.value
      );

      formData.append(
        "discount_percentage",
        discountPercentageRef.current.value
      );

      formData.append(
        "description",
        descriptionRef.current.value
      );

      formData.append(
        "brand_id",
        selectedBrand
      );

      formData.append(
        "color_ids",
        JSON.stringify(selectedColors)
      );

      if (image_file) {

        formData.append("image", image_file);

      }

      const response = await apiClient.put(
        `/product/edit/${params.product_id}`,
        formData,getAuthHeader()
      );

      if (response.data.flag == 1) {

        toast.success(response.data.msg);

        router.replace("/admin/product");

      } else {

        toast.warning(response.data.msg);

      }

    } catch (error) {

      console.log(error);

      toast.warning("Something went wrong");

    }

  };

  return (

    <div className="admin-page space-y-6">

      {/* header */}
      <div className="admin-page-header">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Edit Product
          </h1>

          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Update product details
          </p>

        </div>

        <Link
          href="/admin/product"
          className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 w-fit"
        >

          Back to Products

        </Link>

      </div>

      {/* form */}
      <div className="admin-panel-card p-4 sm:p-6">

        <form
          onSubmit={submitHandler}
          encType="multipart/form-data"
          className="space-y-6"
        >

          {/* sku */}
          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              SKU ID
            </label>

            <input
              type="text"
              ref={skuRef}
              defaultValue={data?.product?.sku_id}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />

          </div>

          {/* product name */}
          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product Name
            </label>

            <input
              type="text"
              ref={nameRef}
              defaultValue={data?.product?.name}
              onChange={nameChangeHandler}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />

          </div>

          {/* slug */}
          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Slug
            </label>

            <input
              type="text"
              ref={slugRef}
              defaultValue={data?.product?.slug}
              readOnly
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5"
            />

          </div>

          {/* prices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              type="number"
              ref={originalPriceRef}
              defaultValue={data?.product?.original_price}
              placeholder="Original Price"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />

            <input
              type="number"
              ref={discountedPriceRef}
              defaultValue={data?.product?.discounted_price}
              placeholder="Discounted Price"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />

            <input
              type="number"
              ref={discountPercentageRef}
              defaultValue={data?.product?.discount_percentage}
              placeholder="Discount %"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />

          </div>

          {/* brand */}
          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Brand
            </label>

            <select
              ref={brandRef}
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
            >

              <option value="">
                Select Brand
              </option>

              {brands.map((brand) => (

                <option
                  key={brand._id}
                  value={brand._id}
                >
                  {brand.name}
                </option>

              ))}

            </select>

          </div>

          {/* colors */}
          <div>

            <label className="mb-3 block text-sm font-medium text-gray-700">
              Colors
            </label>

            <div className="flex flex-wrap gap-3">

              {colors.map((color) => (

                <label
                  key={color._id}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2"
                >

                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color._id)}
                    onChange={() => colorHandler(color._id)}
                  />

                  <span className="text-sm text-gray-700">
                    {color.name}
                  </span>

                </label>

              ))}

            </div>

          </div>

          {/* description */}
          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              rows={5}
              ref={descriptionRef}
              defaultValue={data?.product?.description}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />

          </div>

          {/* current image */}
          {!preview && data?.product?.image_name && (

            <div>

              <p className="mb-2 text-sm font-medium text-gray-700">
                Current Image
              </p>

              <img
                src={buildImageUrl(data?.imageUrl, data?.product?.image_name)}
                alt="product"
                className="h-28 w-28 rounded-lg border border-gray-200 object-cover"
              />

            </div>

          )}

          {/* image upload */}
          <div>

            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={imageRef}
              onChange={imagePreviewHandler}
            />

          </div>

          {/* preview */}
          {preview && (

            <img
              src={preview}
              alt="preview"
              className="h-28 w-28 rounded-lg border border-gray-200 object-cover"
            />

          )}

          {/* submit */}
          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-6 py-2.5 text-white hover:bg-slate-800"
          >

            Update Product

          </button>

        </form>

      </div>

    </div>

  );

}