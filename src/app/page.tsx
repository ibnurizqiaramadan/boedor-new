"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-4">
          {showRegister ? <RegisterForm /> : <LoginForm />}
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowRegister(!showRegister)}
            >
              {showRegister 
                ? "Already have an account? Login" 
                : "Don't have an account? Register"
              }
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Boedor, {user.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            You are logged in as a <span className="font-medium capitalize">{user.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.role === "admin" && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
                <p className="mt-2 text-gray-600">View and manage all users in the system</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Menu Management</h3>
                <p className="mt-2 text-gray-600">Manage menu items and pricing</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
                <p className="mt-2 text-gray-600">View and manage all orders</p>
              </div>
            </>
          )}

          {user.role === "driver" && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Menu Items</h3>
                <p className="mt-2 text-gray-600">View and add menu items</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">My Orders</h3>
                <p className="mt-2 text-gray-600">Manage your delivery orders</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Location Updates</h3>
                <p className="mt-2 text-gray-600">Update your current position</p>
              </div>
            </>
          )}

          {user.role === "user" && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Browse Orders</h3>
                <p className="mt-2 text-gray-600">View available orders to join</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Add Menu Item</h3>
                <p className="mt-2 text-gray-600">Suggest new menu items</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
