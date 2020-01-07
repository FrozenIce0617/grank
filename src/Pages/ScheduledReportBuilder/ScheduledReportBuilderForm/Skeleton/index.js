import React, { Component } from 'react';
import Skeleton from 'Components/Skeleton';
import { Col, Row } from 'reactstrap';

class ScheduledReportBuilderFormSkeleton extends Component {
  render() {
    return (
      <div className="indented-form-group form-group">
        <Col lg={12}>
          <Skeleton
            linesConfig={[
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '50%' } },
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '50%', marginBottom: '10px' } },
            ]}
          />
          <Row>
            <Col lg={6}>
              <Skeleton
                linesConfig={[
                  { type: 'text', options: { width: '30%' } },
                  { type: 'input' },
                  { type: 'text', options: { width: '100%' } },
                ]}
              />
            </Col>
            <Col lg={6}>
              <Skeleton
                linesConfig={[{ type: 'text', options: { width: '30%' } }, { type: 'input' }]}
              />
            </Col>
          </Row>

          <Skeleton
            linesConfig={[
              { type: 'text', options: { width: '30%', marginTop: '10px' } },
              { type: 'input' },
              { type: 'text', options: { width: '50%', marginBottom: '20px' } },
            ]}
          />

          <Row>
            <Col lg={6}>
              <Skeleton linesConfig={[{ type: 'text', options: { width: '30%' } }]} />
            </Col>
            <Col lg={6}>
              <Skeleton
                linesConfig={[{ type: 'text', options: { width: '50%', alignment: 'right' } }]}
              />
            </Col>
          </Row>
          <Skeleton
            linesConfig={[
              { type: 'button', options: { width: '15%', alignment: 'right', marginTop: '20px' } },
            ]}
          />
        </Col>
      </div>
    );
  }
}

export default ScheduledReportBuilderFormSkeleton;
