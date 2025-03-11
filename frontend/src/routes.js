import React from 'react';
import Index from 'views/Index.js';
import Profile from 'views/examples/Profile.js';
import Register from 'views/examples/Register.js';
import Login from 'views/examples/Login.js';
import Tables from 'views/examples/Tables.js';
import Icons from 'views/examples/Icons.js';
import AuthRoute from 'components/AuthRoute.js';
import PasswordReset from './views/examples/PasswordReset.js';
import NewPassword from './views/examples/NewPassword.js';
import Purchases from './views/examples/Purchases.js';
import Expenses from './views/examples/Expenses.js'; // Corrected import path
import UserList from './views/examples/UserList.js'; // Corrected import path
import TaxReportForm from './views/examples/TaxReportForm';  // Add import for TaxReportForm
import TaxReportsList from './views/examples/TaxReportsList'; // Add import for TaxReportsList
import Invoices from "./views/examples/Invoices.js"; // Add import for Items

import Items from './views/examples/Items.js'; // Add import for Items
import SalesReceipts from './views/examples/SalesReceipts'; // Add import for SalesReceipts
import CreateInvoice from './views/examples/CreateInvoice';
import InvoiceList from './views/examples/InvoiceList';
var routes = [
  {
    path: '/index',
    name: 'Dashboard',
    icon: 'ni ni-tv-2 text-primary',
    component: (
        <AuthRoute>
          <Index />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/items',
    name: 'Items',
    icon: 'ni ni-box-2 text-orange',
    component: (
        <AuthRoute>
          <Items />
        </AuthRoute>
    ),
    layout: '/admin',
  },
    {
    path: '/create-invoice',
    name: 'Create Invoice',
    icon: 'ni ni-paper-diploma text-blue',
    component: (
        <AuthRoute>
          <CreateInvoice />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  //  Nouvelle route pour la liste des factures
  {
    path: '/invoices',
    name: 'Invoices List',
    icon: 'ni ni-bullet-list-67 text-green',
    component: (
        <AuthRoute>
          <InvoiceList />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/sales-receipts',
    name: 'Sales Receipts',
    icon: 'ni ni-credit-card text-blue',
    component: (
      <AuthRoute>
        <SalesReceipts />
      </AuthRoute>
    ),
    layout: '/admin',
  },  
  {
    path: '/users',
    name: 'Users List',
    icon: 'ni ni-bullet-list-67 text-red',
    component: (
        <AuthRoute>
          <UserList />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/icons',
    name: 'Icons',
    icon: 'ni ni-planet text-blue',
    component: (
        <AuthRoute>
          <Icons />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/purchases', // Updated path
    name: 'Purchases', // Updated name
    icon: 'ni ni-cart text-orange', // Updated icon
    component: (
        <AuthRoute>
          <Purchases /> {/* Updated component */}
        </AuthRoute>
    ),

    layout: '/admin',
  },
  {
    path: '/invoices1', // Updated path
    name: 'Invoices', // Updated name
    icon: 'ni ni-cart text-orange', // Updated icon
    component: (
        <AuthRoute>
          <Invoices /> {/* Updated component */}
        </AuthRoute>
    ),

    layout: '/admin',
  },
  {
    path: '/expenses', // Updated path
    name: 'Expenses', // Updated name
    icon: 'ni ni-cart text-orange', // Updated icon
    component: (
        <AuthRoute>
          <Expenses /> {/* Updated component */}
        </AuthRoute>
    ),

    layout: '/admin',
  },
  {
    path: '/user-profile',
    name: 'User Profile',
    icon: 'ni ni-single-02 text-yellow',
    component: (
        <AuthRoute>
          <Profile />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/tables',
    name: 'Tables',
    icon: 'ni ni-bullet-list-67 text-red',
    component: (
        <AuthRoute>
          <Tables />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/tax-report',
    name: 'Generate Tax Report',
    icon: 'ni ni-file-03 text-green',
    component: (
        <AuthRoute>
          <TaxReportForm />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/tax-reports',
    name: 'Tax Reports List',
    icon: 'ni ni-collection text-purple',
    component: (
        <AuthRoute>
          <TaxReportsList />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/login',
    name: 'Login',
    icon: 'ni ni-key-25 text-info',
    component: <Login />,
    layout: '/auth',
  },
  {
    path: '/register',
    name: 'Register',
    icon: 'ni ni-circle-08 text-pink',
    component: <Register />,
    layout: '/auth',
  },
  {
    path: '/password-reset',
    name: 'PasswordReset',
    icon: 'ni ni-circle-08 text-pink',
    component: <PasswordReset />,
    layout: '/auth',
  },
  {
    path: '/new-password/:token',
    name: 'PasswordReset',
    icon: 'ni ni-circle-08 text-pink',
    component: <NewPassword />,
    layout: '/auth',
  }
];

export default routes;
