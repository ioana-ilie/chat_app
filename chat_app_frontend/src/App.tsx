import {
  Route,
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import NavBar from "./Navbar";
import Login from "./Login";
import Conversations from "./Conversations";
import Conversation from "./Conversation";
import SignUp from "./Signup";
import ProtectedRoute from "./ProtectedRoute";
import NewConversationUsers from "./NewConversationUsers";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<NavBar />}>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/conversation" element={<Conversations />} />
        <Route path="/newconversation" element={<NewConversationUsers />} />
        <Route path="newconversation/1" element={<Conversation />} />
        <Route
          path="/conversation/:conversationId"
          element={<Conversation />}
        />
        <Route path="*" element={<Navigate to="/conversation" />} />
      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}
