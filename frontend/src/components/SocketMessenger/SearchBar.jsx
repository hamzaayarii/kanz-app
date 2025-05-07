import React from 'react';
import { InputGroup, Input } from 'reactstrap';
import { Search } from 'react-feather';

const SearchBar = ({ searchQuery, handleSearch }) => {
  return (
    <div className="p-2 border-bottom" style={{ backgroundColor: '#FFFFFF' }}>
      <InputGroup>
        <div style={{ position: 'relative', width: '100%' }}>
          <Input 
            placeholder="search in messages" 
            value={searchQuery}
            onChange={handleSearch}
            style={{
              borderRadius: '4px', 
              paddingLeft: '36px',
              backgroundColor: '#EEF3F8',
              border: 'none',
              fontSize: '14px',
              height: '32px'
            }}
          />
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '10px', 
              top: '8px', 
              color: '#666666' 
            }} 
          />
        </div>
      </InputGroup>
      
      <div className="d-flex mt-2 border-bottom">
        <div 
          className="flex-grow-1 text-center py-2"
          style={{ 
            borderBottom: '2px solid #0A66C2', 
            color: '#0A66C2',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          target
        </div>
       
      </div>
    </div>
  );
};

export default SearchBar;