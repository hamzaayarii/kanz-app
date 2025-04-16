import * as Yup from 'yup';

// Validation patterns (shared with backend)
const validationPatterns = {
    phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,  // Phone number validation
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // Email validation
    taxNumber: /^\d{8}[A-Z](\/M\/\d{3})?$/, // 8 digits + letter, optional /M/000 suffix
    rneNumber: /^[A-Z]\d{7,10}$/ // Letter followed by 7-10 digits
};

// Yup validation schema
export const businessValidationSchema = Yup.object().shape({
    businessName: Yup.string()
        .required('Business Name is required')
        .min(3, 'Business Name must be at least 3 characters'),
    typeOfActivity: Yup.string().required('Type of Activity is required'),
    taxRegistrationNumber: Yup.string()
        .required('Matricule Fiscal is required')
        .matches(
            validationPatterns.taxNumber, 
            'Tax number should be in format 12345678A or 12345678A/M/000'
        ),
    rneNumber: Yup.string()
        .required('RNE Number is required')
        .matches(
            validationPatterns.rneNumber, 
            'RNE must start with a letter (A/B/C/D) followed by 7-10 digits (e.g., B12345678)'
        ),
    address: Yup.string()
        .required('Address is required')
        .min(5, 'Address must be at least 5 characters'),
    phoneNumber: Yup.string()
        .required('Phone Number is required')
        .matches(validationPatterns.phone, 'Please enter a valid phone number'),
    email: Yup.string()
        .email('Invalid email')
        .required('Email is required')
        .matches(validationPatterns.email, 'Please enter a valid email address'),
    companyWebsite: Yup.string().url('Invalid URL'),
});
