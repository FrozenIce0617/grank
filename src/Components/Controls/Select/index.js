// @flow
import * as React from 'react';
import Select, { AsyncCreatable, Async, Creatable } from 'react-select';
import debounce from 'debounce-promise';

const toSelect = Component =>
  React.forwardRef((props: Object, ref) => {
    const className = props.showError ? 'invalid' : '';
    const element = <Component {...props} ref={ref} />;
    return (
      <div className={className}>
        {!props.hideLabel && <label className={props.labelClassname}>{props.labelText}</label>}
        {element}
      </div>
    );
  });

const withDebounce = (Component: React.ComponentType<any>) =>
  class WithDebounce extends React.Component<any> {
    constructor(props: any) {
      super(props);
      const debounceInterval = props.debounceInterval;
      if (debounceInterval && debounceInterval > 0) {
        this.debouncedLoadOptions = debounce(this.debouncedLoadOptions, debounceInterval);
      }
      const minQueryLength = props.minQueryLength;
      if (props.minQueryLength && props.minQueryLength > 0) {
        const currentDebounceFunc = this.debouncedLoadOptions;
        this.debouncedLoadOptions = (query: string) => {
          if (!query || query.length < minQueryLength) {
            return Promise.resolve({
              options: [],
              complete: true,
            });
          }
          return currentDebounceFunc(query);
        };
      }
    }

    debouncedLoadOptions = (query: any) => this.props.loadOptions(query);

    render() {
      const { debounceInterval, minQueryLength, loadOptions, ...props } = this.props;
      return <Component loadOptions={this.debouncedLoadOptions} {...props} />;
    }
  };

export default toSelect(Select);
export const CreatableSelect = toSelect(Creatable);
export const AsyncCreatableSelect = toSelect(AsyncCreatable);
export const AsyncSelect = toSelect(withDebounce(Async));
