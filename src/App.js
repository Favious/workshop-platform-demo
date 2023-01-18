import React from "react";
import styled from "styled-components";
import Dashboard from "./pages/DashboardPage";
import Sidebar from "./components/Sidebar";
import { GlobalStyle } from "./GlobalStyle";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import MainComponent from "./components/MainComponent";
import CreateOrder from "./pages/CreateOrderPage";
import OrdersListPage from "./pages/OrdersListPage";
import ServicesSparesPage from "./pages/ServicesSparesPage";
import EditOrderPage from "./pages/EditOrderPage";
import { Helmet, HelmetProvider } from "react-helmet-async";

export default function App() {
  const helmetContext = {};
  return (
    <HelmetProvider context={helmetContext}>
      <Helmet>
        <meta name=" theme-color" content="#153d77" />
      </Helmet>
      <Div>
        <GlobalStyle />
        <Router>
          <AuthProvider>
            <Sidebar />
            <Routes>
                <Route exact path="/" element={<Dashboard />}/>
                <Route
                  path="/orders"
                  element={<MainComponent children={<OrdersListPage />} />}
                />
                <Route
                  path="/create_order"
                  element={<MainComponent children={<CreateOrder />} />}
                />
                <Route
                  path="/orders/edit/:order_id"
                  element={<MainComponent children={<EditOrderPage />} />}
                />
                <Route
                  path="/orders/services/:order_id"
                  element={<MainComponent children={<ServicesSparesPage />} />}
                />

              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </AuthProvider>
        </Router>
      </Div>
    </HelmetProvider>
  );
}

const Div = styled.div`
  position: relative;
`;
