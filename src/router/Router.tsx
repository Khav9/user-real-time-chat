import Register from "@/modules/auth/page/Register";
import Login from "@/modules/auth/page/Login";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayot from "@/RootLayot";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayot />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
