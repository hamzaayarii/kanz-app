import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import routes from "../../routes";

const StandaloneLayout = () => {
    const getRoutes = (routes) => {
        return routes
            .filter((prop) => prop.layout === "/standalone")
            .map((prop, key) => {
                return (
                    <Route path={prop.path} element={prop.component} key={key} />
                );
            });
    };

    return (
        <div className="standalone-layout">
            <Routes>
                {getRoutes(routes)}
                <Route path="*" element={<Navigate to="/standalone/business-registration" replace />} />
            </Routes>
        </div>
    );
};

export default StandaloneLayout;