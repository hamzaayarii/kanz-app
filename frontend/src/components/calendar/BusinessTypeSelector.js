import React from 'react';
import { FormGroup, Label, Input, Card, CardBody, CardHeader } from 'reactstrap';
import { BUSINESS_TYPES } from '../../services/TaxDeadlineService';
import './BusinessTypeSelector.css';

const BusinessTypeSelector = ({ selectedType, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const getBusinessTypeDescription = (type) => {
    switch(type) {
      case BUSINESS_TYPES.SARL:
        return 'Limited Liability Company with multiple shareholders';
      case BUSINESS_TYPES.SUARL:
        return 'Single-member Limited Liability Company';
      case BUSINESS_TYPES.SA:
        return 'Public Limited Company with many shareholders';
      case BUSINESS_TYPES.SAS:
        return 'Simplified Joint-Stock Company';
      case BUSINESS_TYPES.INDIVIDUAL:
        return 'Personal tax status for sole proprietors';
      case BUSINESS_TYPES.FREELANCE:
        return 'Independent contractor or self-employed professional';
      default:
        return '';
    }
  };

  return (
    <Card className="business-type-selector">
      <CardHeader>
        <h5 className="mb-0">Select Business Type</h5>
      </CardHeader>
      <CardBody>
        <FormGroup>
          <Label for="businessTypeSelect">Business Type</Label>
          <Input
            type="select"
            name="businessType"
            id="businessTypeSelect"
            value={selectedType}
            onChange={handleChange}
          >
            {Object.values(BUSINESS_TYPES).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Input>
          
          {selectedType && (
            <div className="business-type-description mt-2">
              <small className="text-muted">{getBusinessTypeDescription(selectedType)}</small>
            </div>
          )}
        </FormGroup>
      </CardBody>
    </Card>
  );
};

export default BusinessTypeSelector;
