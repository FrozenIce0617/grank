import React, { Component } from 'react';
import Skeleton from 'Components/Skeleton';

class AddDomainSkeleton extends Component {
  render() {
    return (
      <Skeleton
        className="indented-form-group form-group"
        linesConfig={[
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '100%' } },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '100%' } },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '100%' } },
          { type: 'text', options: { width: '35%' } },
          { type: 'text', options: { width: '25%' } },
          { type: 'button', options: { width: '15%', alignment: 'right' } },
        ]}
      />
    );
  }
}

export default AddDomainSkeleton;
