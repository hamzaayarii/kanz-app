import * as Yup from 'yup';

export const businessValidationSchema = Yup.object().shape({
  businessName: Yup.string().required('Required'),
  typeOfActivity: Yup.string().required('Required'),
  taxRegistrationNumber: Yup.string().required('Required'),
  address: Yup.string().required('Required'),
  phoneNumber: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  companyWebsite: Yup.string().url('Invalid URL'),
});
