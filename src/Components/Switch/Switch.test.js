import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Switch from './index';

Enzyme.configure({ adapter: new Adapter() });

let testData = [
  { id: 1, name: 'Day', active: false },
  { id: 7, name: 'Week', active: true },
  { id: 30, name: 'Month', active: false },
];

describe('Switch component', () => {
  let wrapper, props;
  const jestOnClick = jest.fn();

  beforeEach(() => {
    props = {
      els: testData,
      onClick: jestOnClick,
    };

    wrapper = shallow(<Switch {...props} />);
  });

  // Tests

  it('renders without crashing', () => {
    expect(wrapper.exists()).toEqual(true);
  });

  it('renders a switch el per `els`', () => {
    const switchEls = wrapper.find('.Switch-text');
    expect(switchEls.length).toEqual(3);
  });

  it('calls `onClick` with all el props when switch el is clicked', () => {
    const switchEls = wrapper.find('.Switch-text');

    switchEls.first().simulate('click');
    expect(jestOnClick).toBeCalledWith({ id: 1, name: 'Day', active: false });
  });

  it('applies new `width` to wrapping div when set as prop', () => {
    wrapper.setProps({ width: 400 });

    const wrappingDiv = wrapper.find('div').first();
    expect(wrappingDiv.props().style.width).toBe(400);
  });
});
