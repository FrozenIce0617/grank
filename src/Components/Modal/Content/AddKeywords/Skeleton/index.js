import * as React from 'react';
import Skeleton from 'Components/Skeleton';

class AddKeywordsSkeleton extends React.Component<{}> {
  render() {
    return (
      <form className="add-keywords-form">
        <div className="columns-container">
          <div className="keywords-column">
            <Skeleton
              linesConfig={[{ type: 'text', options: { width: '40%' } }, { type: 'input' }]}
            />
          </div>
          <div className="settings-column">
            <Skeleton
              linesConfig={[
                { type: 'text', options: { width: '40%' } },
                { type: 'input' },
                { type: 'text', options: { width: '40%' } },
                { type: 'input' },
                { type: 'text', options: { width: '40%' } },
                { type: 'input' },
              ]}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default AddKeywordsSkeleton;
