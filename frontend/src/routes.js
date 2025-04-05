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
import Journal from './views/examples/Journal';
import CreateInvoice from './views/examples/CreateInvoice';
import InvoiceList from './views/examples/InvoiceList';
import EmployeeManagement  from "./views/examples/EmployeeManagement";
import FinancialStatements from './views/examples/FinancialStatements'; // Add import for FinancialStatements
import PayrollManagement   from "./views/examples/PayrollManagement";
import BusinessRegistrationPage from './views/buisness/BusinessRegistrationPage.js';
import BusinessManagement from './views/buisness/BusinessManagement.js';
import AssignAccountant from './views/accountant/AssignAccountant.js';
import DailyRevenue from './views/examples/DailyRevenue';

import Chat from './views/chat/Chat.js';
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
    path: '/EmployeeManagement',
    name: 'EmployeeManagement',
    icon: 'ni ni-tv-2 text-primary',
    component: (
        <AuthRoute>
          <EmployeeManagement />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/FinancialStatements',
    name: 'FinancialStatements',
    icon: 'ni ni-tv-2 text-primary',
    component: (
        <AuthRoute>
          <FinancialStatements />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/PayrollManagement',
    name: 'PayrollManagement',
    icon: 'ni ni-tv-2 text-primary',
    component: (
        <AuthRoute>
          <PayrollManagement />
        </AuthRoute>
    ),
    layout: '/admin',
  },
  {
    path: '/business-management',
    name: 'Business Management',
    icon: 'ni ni-building text-primary',
    component: (
      <AuthRoute>
        <BusinessManagement />
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
    path: '/journal',
    name: 'Journal Comptable',
    icon: 'ni ni-book-bookmark text-primary',
    component: (
        <AuthRoute>
            <Journal />
        </AuthRoute>
    ),
    layout: '/admin'
  },
  {
    path: '/daily-revenue',
    name: 'Daily Revenue',
    icon: 'ni ni-money-coins text-success',
    component: (
      <AuthRoute>
        <DailyRevenue />
      </AuthRoute>
    ),
    layout: '/admin'
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
    showInSidebar: false
  },
  {
    path: '/register',
    name: 'Register',
    icon: 'ni ni-circle-08 text-pink',
    component: <Register />,
    layout: '/auth',
    showInSidebar: false
  },
  {
    path: '/password-reset',
    name: 'PasswordReset',
    icon: 'ni ni-circle-08 text-pink',
    component: <PasswordReset />,
    layout: '/auth',
    showInSidebar: false
  },
  {
    path: '/new-password/:token',
    name: 'PasswordReset',
    icon: 'ni ni-circle-08 text-pink',
    component: <NewPassword />,
    layout: '/auth',
    showInSidebar: false
  },
  // Standalone routes
  {
    path: '/business-registration',
    name: 'Business Registration',
    component: <BusinessRegistrationPage />,
    layout: '/standalone',
  },
  {
    path: '/assign-accountant',
    name: 'Assign Accountant',
    icon: 'ni ni-single-02 text-green', // Choose an appropriate icon
    component: (
      <AuthRoute>
        <AssignAccountant />
      </AuthRoute>
    ),
    layout: '/admin',
  },
 
];

export default routes;
