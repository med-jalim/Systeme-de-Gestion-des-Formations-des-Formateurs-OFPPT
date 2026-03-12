import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { PlansListPage } from "./features/training-plans/views/PlansListPage";
import { PlanCreatePage } from "./features/training-plans/pages/PlanCreatePage";
import { PlanDetailsPage } from "./features/training-plans/pages/PlanDetailsPage";
import { FormationsListPage } from "./features/formations/pages/FormationsListPage";
import { FormationCreatePage } from "./features/formations/pages/FormationCreatePage";
import { FormationDetailsPage } from "./features/formations/pages/FormationDetailsPage";
import { SitesPage } from "./features/sites/pages/SitesPage";
import { AccommodationsPage } from "./features/accommodations/pages/AccommodationsPage";
import { DirectionsPage } from "./features/directions/pages/DirectionsPage";
import { CentresPage } from "./features/centres/pages/CentresPage";
import { UsersPage } from "./features/users/pages/UsersPage";

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
      {
        path: "plans/:id",
        element: <PlanDetailsPage />,
      },
      {
        path: "formations",
        element: <FormationsListPage />,
      },
      {
        path: "formations/new",
        element: <FormationCreatePage />,
      },
      {
        path: "formations/:id",
        element: <FormationDetailsPage />,
      },
      {
        path: "sites",
        element: <SitesPage />,
      },
      {
        path: "accommodations",
        element: <AccommodationsPage />,
      },
      {
        path: "directions",
        element: <DirectionsPage />,
      },
      {
        path: "centres",
        element: <CentresPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
    ],
  },
  // Future auth routes like /login could go outside the DashboardLayout here
]);
