import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Container, 
  Row, 
  Col 
} from 'reactstrap';
import Header from 'components/Headers/Header.js';

const Chat = () => {
  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Chat</h3>
              </CardHeader>
              <CardBody>
                <p className="description">
                  This is a standalone chat page. The floating chat component is available throughout the application.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Chat;