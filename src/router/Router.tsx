import Register from "@/modules/auth/page/Register";
import Login from "@/modules/auth/page/Login";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import RootLayot from "@/RootLayot";
import { ProtectedRoute } from "./protected";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayot />
      </ProtectedRoute>
    ),
  },
  {
    path: "/servers/:serverId",
    element: (
      <ProtectedRoute>
        <RootLayot />
      </ProtectedRoute>
    ),
  },
  {
    path: "/servers/:serverId/channels/:channelId",
    element: (
      <ProtectedRoute>
        <RootLayot />
      </ProtectedRoute>
    ),
  },
  {
    path: "/servers/:serverId/channels/:channelId/messages/:messageId",
    element: (
      <ProtectedRoute>
        <RootLayot />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
