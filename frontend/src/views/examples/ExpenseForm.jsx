
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Save, XCircle } from 'lucide-react';
import ReceiptScanner from './ReceiptScanner';

const ExpenseForm = () => {
  const [showScanner, setShowScanner] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: '',
      tax: '',
      vendor: '',
      reference: '',
      description: '',
      category: '',
      paymentMethod: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // API call would go here
      console.log('Expense data submitted:', data);
      
      // Reset form after successful submission
      reset();
      
      // Show success message
      alert('Expense successfully submitted!');
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('Error submitting expense. Please try again.');
    }
  };

  // Handle data extracted from receipt scanner
  const handleExtractedData = (data) => {
    // Update form values with extracted data
    Object.entries(data).forEach(([key, value]) => {
      if (value) setValue(key, value);
    });
    
    // Close scanner
    setShowScanner(false);
  };

  // Watch form values for validation
  const amount = watch('amount');

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">New Expense</h1>
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
        >
          <Camera size={18} className="mr-2" />
          Scan Receipt
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Payee</label>
            <input
              type="text"
              placeholder="Enter vendor name"
              {...register('vendor', { required: 'Vendor is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.vendor && <p className="mt-1 text-sm text-red-600">{errors.vendor.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="text"
                placeholder="0.00"
                {...register('amount', {
                  required: 'Amount is required',
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: 'Please enter a valid amount'
                  }
                })}
                className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="text"
                placeholder="0.00"
                {...register('tax', {
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: 'Please enter a valid tax amount'
                  }
                })}
                className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.tax && <p className="mt-1 text-sm text-red-600">{errors.tax.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference/Invoice #</label>
            <input
              type="text"
              placeholder="Enter reference number"
              {...register('reference')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              <option value="office">Office Supplies</option>
              <option value="travel">Travel</option>
              <option value="meals">Meals & Entertainment</option>
              <option value="software">Software & Subscriptions</option>
              <option value="utilities">Utilities</option>
              <option value="other">Other</option>
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              {...register('paymentMethod', { required: 'Payment method is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select payment method</option>
              <option value="creditCard">Credit Card</option>
              <option value="debitCard">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="bankTransfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
            {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows="3"
            placeholder="Enter description"
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 flex items-center"
          >
            <XCircle size={18} className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center disabled:bg-green-400"
          >
            <Save size={18} className="mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </form>
      
      {/* Receipt Scanner Modal */}
      {showScanner && (
        <ReceiptScanner 
          onDataExtracted={handleExtractedData}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default ExpenseForm;