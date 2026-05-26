import "./globals.css";
import { ToastContainer } from "react-toastify";
import ReduxProvider from "@/redux/ReduxProvider";
import "react-toastify/dist/ReactToastify.css";


export const metadata = {
  title: "iShop - E-Commerce Platform",
  description: "Modern e-commerce platform with admin panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body>

        <ReduxProvider>

          {children}

          <ToastContainer
            position="top-right"
            autoClose={2000}
          />

        </ReduxProvider>

      </body>

    </html>
  );
}