// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

// actions
import { hideModal } from 'Actions/ModalAction';

// components
import ModalBorder from 'Components/Modal/Layout/ModalBorder';

type StepTo = (step: string, data: any) => void;

export type WizardContentWrapper = (content: any, currentStep: string) => any;

type WizardStepProps = {
  stepTo: StepTo,
  data: Object,
};

type WizardStepTitleProps = {
  data: Object,
};

export type WizardStepDetails = {
  component: (props: WizardStepProps) => any, // FIXME returns component
  title: string | ((props: WizardStepTitleProps) => string),
  name?: string,
};

type WizardSteps = {
  [name: string]: WizardStepDetails,
};

type WizardStepDataDetails = {
  data: Object,
  prevStep: string,
};

type WizardStepsData = {
  [step: string]: WizardStepDataDetails,
};

type Props = {
  className: string,
  steps: WizardSteps,
  defaultStep: string,
  contentWrapper?: WizardContentWrapper,

  // automatic
  hideModal: Function,
};

type State = {
  currentStep: string,
  data: WizardStepsData,
};

export const stepWithProps = (stepTo: StepTo, step: string) => (props: any) => stepTo(step, props);

class Wizard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    if (isEmpty(props.steps)) {
      return;
    }

    this.state = {
      currentStep: props.defaultStep,
      data: {},
    };
  }

  handleStepTo = (step, dataForStep) => {
    const { currentStep, data } = this.state;
    this.setState({
      currentStep: step,
      data: {
        ...data,
        [currentStep]: dataForStep,
      },
    });
  };

  wrapStepContent = (content, step) => {
    const { contentWrapper } = this.props;
    return contentWrapper ? contentWrapper(content, step) : content;
  };

  render() {
    const { steps, className } = this.props;
    const { currentStep, data } = this.state;
    if (isEmpty(steps)) {
      return null;
    }

    const { title, component: StepComponent } = steps[currentStep];

    const titleResult = typeof title === 'function' ? title({ data }) : title;
    return (
      <ModalBorder className={className} title={titleResult} onClose={this.props.hideModal}>
        {this.wrapStepContent(
          <StepComponent stepTo={this.handleStepTo} data={data} />,
          currentStep,
        )}
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(Wizard);
