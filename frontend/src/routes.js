import React from 'react';
import Index from 'views/Index.js';
import Profile from 'views/examples/Profile.js';
import Register from 'views/examples/Register.js';
import Login from 'views/examples/Login.js';
import Tables from 'views/examples/Tables.js';
import Icons from 'views/examples/Icons.js';
import AuthRoute, { AdminRoute, isUserAdmin, BusinessOwnerRoute, isUserAccountant, isUserBusinessOwner } from 'components/AuthRoute.js';
import PasswordReset from './views/examples/PasswordReset.js';
import NewPassword from './views/examples/NewPassword.js';
import Purchases from './views/examples/Purchases.js';
import Expenses from './views/examples/Expenses.js';
import UserList from './views/examples/UserList.js';
import TaxReportForm from './views/examples/TaxReportForm.js';
import TaxReportsList from './views/examples/TaxReportsList.js';
import Invoices from './views/examples/Invoices.js';
import Items from './views/examples/Items.js';
import Journal from './views/examples/Journal';
import CreateInvoice from './views/examples/CreateInvoice';
import InvoiceList from './views/examples/InvoiceList';
import EmployeeManagement from './views/examples/EmployeeManagement';
import FinancialStatements from './views/examples/FinancialStatements';
import PayrollManagement from './views/examples/PayrollManagement';
import BusinessRegistrationPage from './views/buisness/BusinessRegistrationPage.js';
import BusinessManagement from './views/buisness/BusinessManagement.js';
import AssignAccountant from './views/accountant/AssignAccountant.js';
import DailyRevenue from './views/examples/DailyRevenue';
import DailyRevenueList from './views/examples/DailyRevenueList';
import Categories from "./views/examples/Categories";
import EmailVerification from './views/examples/EmailVerification.js';
import AccountantBusinessOwners from './views/examples/AccountantBusinessOwners.js';
import OwnerFinancialReports from "./views/examples/OwnerFinancialReports.js";
import BusinessUpdatePage from './views/buisness/BusinessUpdatePage.js';

// Grouped and enhanced routes for better UX
const routes = [
  // Dashboard & Overview
  {
    path: '/index',
    name: 'Dashboard Hub',
    icon: 'ni ni-tv-2 text-primary',
    description: 'Your business at a glance',
    component: <AuthRoute><Index /></AuthRoute>,
    layout: '/admin',
    category: 'Overview',
    showInSidebar: () => true, // Visible to all authenticated users
  },
  {
    path: '/buisness asigned to',
    name: 'My Clients',
    icon: 'ni ni-money-coins text-success',
    description: 'Track your daily revenue flow',
    component: <AuthRoute><AccountantBusinessOwners /></AuthRoute>,
    layout: '/admin',
    category: 'Overview',
   // showInSidebar: () => true, 
    showInSidebar: isUserAccountant,
  },
  {
    path: '/daily-revenue',
    name: 'Daily Money Flow',
    icon: 'ni ni-money-coins text-success',
    description: 'Track your daily revenue flow',
    component: <AuthRoute><DailyRevenue /></AuthRoute>,
    layout: '/admin',
    category: 'Overview',
    showInSidebar: () => true,
  },
  {
    path: '/daily-revenue/edit/:id',
    name: 'Edit Daily Money Flow',
    icon: 'ni ni-money-coins text-success',
    description: 'Edit daily revenue entry',
    component: <AuthRoute><DailyRevenue /></AuthRoute>,
    layout: '/admin',
    category: 'Overview',
    showInSidebar: () => false, // Hide from sidebar
  },
  {
    path: '/daily-revenue-list',
    name: 'Daily Money Flow History',
    icon: 'ni ni-chart-pie-35 text-info',
    description: 'View all daily revenue entries',
    component: <AuthRoute><DailyRevenueList /></AuthRoute>,
    layout: '/admin',
    category: 'Overview',
    showInSidebar: () => true,
  },

  // Financial Management
  {
    path: '/journal',
    name: 'Accounting Journal',
    icon: 'ni ni-book-bookmark text-indigo',
    description: 'Log all your financial entries',
    component: <AuthRoute><Journal /></AuthRoute>,
    layout: '/admin',
    category: 'Finance',
    showInSidebar: isUserAccountant,
  },
  {
    path: '/purchases',
    name: 'Purchases',
    icon: 'ni ni-cart text-orange',
    description: 'Manage your spending',
    component: <AuthRoute><Purchases /></AuthRoute>,
    layout: '/admin',
    category: 'Finance',
    showInSidebar: isUserAccountant,
  },
  {
    path: '/expenses',
    name: 'Expenses',
    icon: 'ni ni-credit-card text-red',
    description: 'Keep expenses in check',
    component: <AuthRoute><Expenses /></AuthRoute>,
    layout: '/admin',
    category: 'Finance',
    showInSidebar: isUserBusinessOwner,
  },
  {
    path: '/invoices1',
    name: 'Invoice Tracker',
    icon: 'ni ni-paper-diploma text-blue',
    description: 'Monitor all invoices',
    component: <AuthRoute><Invoices /></AuthRoute>,
    layout: '/admin',
    category: 'Finance',
    showInSidebar: () => true, // Both should be able to track invoices
  },
  {
    path: '/create-invoice',
    name: 'New Invoice',
    icon: 'ni ni-fat-add text-teal',
    description: 'Create a fresh invoice',
    component: <AuthRoute><CreateInvoice /></AuthRoute>,
    layout: '/admin',
    category: 'Finance',
    showInSidebar: () => true, // Changed to allow both roles to create invoices
  },
  {
    path: '/invoices',
    name: 'Invoice List',
    icon: 'ni ni-bullet-list-67 text-green',
    description: 'View all invoices',
    component: <AuthRoute><InvoiceList /></AuthRoute>,
    layout: '/admin',
    category: 'Finance',
    showInSidebar: () => true, // Both should be able to view invoices
  },

  {
    path: '/financial-statements',
    name: 'Financial Reports',
    icon: 'ni ni-chart-bar-32 text-purple',
    description: 'Detailed financial insights',
    component: <AuthRoute><FinancialStatements /></AuthRoute>,
    layout: '/admin',
    category: 'Finance',
    showInSidebar: isUserAccountant,
  },

  {
    path: '/financial-statements-list',
    name: 'Financial Reports',
    icon: 'ni ni-chart-bar-32 text-purple',
    description: 'Detailed financial insights',
    component: <AuthRoute><OwnerFinancialReports /></AuthRoute>,
    layout: '/admin',
    category: 'Finance',
    showInSidebar: isUserBusinessOwner,
  },

  // Tax Management
  {
    path: '/tax-report',
    name: 'Tax Report Generator',
    icon: 'ni ni-single-copy-04 text-green',
    description: 'Prepare your tax reports',
    component: <AuthRoute><TaxReportForm /></AuthRoute>,
    layout: '/admin',
    category: 'Taxes',
    showInSidebar: isUserAccountant,
  },
  {
    path: '/tax-reports',
    name: 'Tax Reports Archive',
    icon: 'ni ni-archive-2 text-purple',
    description: 'Browse past tax reports',
    component: <AuthRoute><TaxReportsList /></AuthRoute>,
    layout: '/admin',
    category: 'Taxes',
    showInSidebar: isUserAccountant,
  },

  // Business & Employee Management
  {
    path: '/business-management',
    name: 'Business Control',
    icon: 'ni ni-building text-primary',
    description: 'Manage your business settings',
    component: <AuthRoute><BusinessManagement /></AuthRoute>,
    layout: '/admin',
    category: 'Business',
    showInSidebar: isUserAdmin,
  },
  {
    path: '/employee-management',
    name: 'Employee Management',
    icon: 'ni ni-badge text-yellow',
    description: 'Oversee your employees',
    component: <AuthRoute><EmployeeManagement /></AuthRoute>,
    layout: '/admin',
    category: 'Business',
    showInSidebar: isUserBusinessOwner,
  },
  {
    path: '/payroll-management',
    name: 'Payroll Center',
    icon: 'ni ni-money-coins text-teal',
    description: 'Handle payroll with ease',
    component: <AuthRoute><PayrollManagement /></AuthRoute>,
    layout: '/admin',
    category: 'Business',
    showInSidebar: isUserBusinessOwner,
  },
  {
    path: '/assign-accountant',
    name: 'Accountant Setup',
    icon: 'ni ni-single-02 text-green',
    description: 'Link an accountant',
    component: <AuthRoute><AssignAccountant /></AuthRoute>,
    layout: '/admin',
    category: 'Business',
    showInSidebar: isUserBusinessOwner,
  },

  // Inventory & Assets
  {
    path: '/items',
    name: 'Inventory',
    icon: 'ni ni-box-2 text-orange',
    description: 'Track your stock',
    component: <AuthRoute><Items /></AuthRoute>,
    layout: '/admin',
    category: 'Inventory',
    showInSidebar: isUserBusinessOwner,
  },

  // User Management
  {
    path: '/user-profile',
    name: 'My Profile',
    icon: 'ni ni-circle-08 text-yellow',
    description: 'Update your details',
    component: <AuthRoute><Profile /></AuthRoute>,
    layout: '/admin',
    category: 'Users',
  },
  {
    path: '/users',
    name: 'User Directory',
    icon: 'ni ni-single-02 text-red',
    description: 'Manage all users',
    component: <AdminRoute><UserList /></AdminRoute>,
    layout: '/admin',
    category: 'Users',
    showInSidebar: isUserAdmin,
  },

  {
    path: '/login',
    name: 'Login',
    icon: 'ni ni-key-25 text-info',
    component: <Login />,
    layout: '/auth',
    showInSidebar: false,
  },
  {
    path: '/register',
    name: 'Sign Up',
    icon: 'ni ni-circle-08 text-pink',
    component: <Register />,
    layout: '/auth',
    showInSidebar: false,
  },
  {
    path: '/verify-email/:token',
    name: 'Verify Email',
    icon: 'ni ni-check-bold text-green',
    component: <EmailVerification />,
    layout: '/auth',
    showInSidebar: false,
  },
  {
    path: '/password-reset',
    name: 'Reset Password',
    icon: 'ni ni-lock-circle-open text-pink',
    component: <PasswordReset />,
    layout: '/auth',
    showInSidebar: false,
  },
  {
    path: '/new-password/:token',
    name: 'Set New Password',
    icon: 'ni ni-lock-circle-open text-pink',
    component: <NewPassword />,
    layout: '/auth',
    showInSidebar: false,
  },


  {
    path: '/business-registration',
    name: 'Start Your Business',
    icon: 'ni ni-briefcase-24 text-primary',
    component: <BusinessOwnerRoute><BusinessRegistrationPage /></BusinessOwnerRoute>,
    layout: '/standalone',
    showInSidebar: isUserBusinessOwner,
  },
  {
    path: '/business-update/:id',  // New route for updates
    name: 'Update Business',
    icon: 'ni ni-briefcase-24 text-primary',
    component: <BusinessOwnerRoute><BusinessUpdatePage /></BusinessOwnerRoute>,
    layout: '/admin',
    showInSidebar: false,  // Typically don't show update in sidebar as it's context-specific
},
  {
    path: '/category',
    name: 'Category Management',
    component: (
        <AuthRoute>
          <Categories />
        </AuthRoute>
    ),
    layout: '/admin',
    showInSidebar: isUserAdmin,
  },
];

export default routes;