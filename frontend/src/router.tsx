import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { PlansListPage } from "./features/training-plans/views/PlansListPage";
import { PlanCreatePage } from "./features/training-plans/pages/PlanCreatePage";
// import { PlanDetailsPage } from "./features/training-plans/pages/PlanDetailsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/plans" replace />,
      },
      {
        path: "plans",
        element: <PlansListPage />,
      },
      {
        path: "plans/new",
        element: <PlanCreatePage />,
      },
      // {
      //   path: "plans/:id",
      //   element: <PlanDetailsPage />,
      // }
    ],
  },
  // Future auth routes like /login could go outside the DashboardLayout here
]);
