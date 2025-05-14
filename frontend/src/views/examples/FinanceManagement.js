import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, Container, Row, Col } from 'react-bootstrap';
import Expenses from './Expenses';
import DailyRevenue from './DailyRevenue';

const FinanceManagement = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [key, setKey] = useState('expenses');

  return (
    <Container className="mt-4" fluid>
      <Row>
        <Col>
          <Card className="shadow">
            <Card.Header>
              <h3 className="mb-0">Finance Management</h3>
            </Card.Header>
            <Card.Body>
              <Tabs
                id="finance-tabs"
                activeKey={activeTab}
                onSelect={(k) => {
                  setActiveTab(k);
                  setKey(k);
                }}
                className="mb-3"
              >
                <Tab eventKey="expenses" title="Expenses">
                  <div className="mt-3">
                    <Expenses />
                  </div>
                </Tab>
                <Tab eventKey="revenue" title="Revenue">
                  <div className="mt-3">
                    <DailyRevenue />
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FinanceManagement;