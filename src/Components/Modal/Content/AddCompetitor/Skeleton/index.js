import React, { Component } from 'react';
import Skeleton from 'Components/Skeleton';

class AddSubAccountSkeleton extends Component {
  render() {
    return (
      <Skeleton
        className="indented-form-group form-group"
        linesConfig={[
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'input' },
          { type: 'text', options: { width: '35%' } },
          { type: 'text', options: { width: '25%' } },
          { type: 'subtitle', options: { width: '20%' } },
          { type: 'button', options: { width: '45%', alignment: 'center' } },
        ]}
      />
    );
  }
}

export default AddSubAccountSkeleton;
