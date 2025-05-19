import React from 'react';
import { InputGroup, Input } from 'reactstrap';
import { Search } from 'react-feather';

const SearchBar = ({ searchQuery, handleSearch }) => {
  return (
    <div className="p-2 border-bottom" style={{ 
      backgroundColor: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <InputGroup>
        <div style={{ position: 'relative', width: '100%' }}>
          <Input 
            placeholder="Search contacts..." 
            value={searchQuery}
            onChange={handleSearch}
            style={{
              borderRadius: '20px', 
              paddingLeft: '38px',
              backgroundColor: '#F5F5F5',
              border: 'none',
              fontSize: '14px',
              height: '38px',
              transition: 'all 0.2s ease',
            }}
            className="search-input"
            onFocus={(e) => e.target.style.boxShadow = 'inset 0 0 0 1px #4a6cf7'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '11px', 
              color: '#666666' 
            }} 
          />
        </div>
      </InputGroup>
      
      <div className="d-flex mt-2" style={{ borderBottom: '1px solid #EFEFEF' }}>
        <div 
          className="flex-grow-1 text-center py-2"
          style={{ 
            borderBottom: '2px solid #4776E6', 
            color: '#4776E6',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Chats
        </div>
        <div 
          className="flex-grow-1 text-center py-2"
          style={{ 
            color: '#888888',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#666666'}
          onMouseLeave={(e) => e.target.style.color = '#888888'}
        >
          Contacts
        </div>
      </div>
    </div>
  );
};

export default SearchBar;