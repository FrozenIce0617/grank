// @flow
import React, { Component } from 'react';

import Wizard, { stepWithProps } from 'Components/Modal/Wizard';
import type { WizardStepDetails, WizardContentWrapper } from 'Components/Modal/Wizard';

type Props = {
  className: string,
  contentWrapper?: WizardContentWrapper,

  // steps
  preSteps?: WizardStepDetails[],
  selectStep?: WizardStepDetails,
  connectStep?: WizardStepDetails,
  saveStep?: WizardStepDetails,
  connectedStep?: WizardStepDetails,
  postSteps?: WizardStepDetails[],

  step: string,
};

type State = {
  currentStep: string,
};

export const STEPS = {
  SELECT: 'selectStep',
  CONNECT: 'connectStep',
  SAVE: 'saveStep',
  CONNECTED: 'connectedStep',
};

export const withProps = stepWithProps;

export default class AccountWizard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentStep: props.step || STEPS.SELECT,
    };
  }

  transformSteps = (steps?: WizardStepDetails[]) =>
    steps
      ? steps.reduce((acc, stepItem) => {
          if (stepItem.name) {
            acc[stepItem.name] = stepItem;
          }
          return acc;
        }, {})
      : {};

  render() {
    const {
      className,
      step,
      preSteps,
      selectStep,
      connectStep,
      saveStep,
      postSteps,
      connectedStep,
      contentWrapper,
    } = this.props;
    return (
      <Wizard
        className={className}
        steps={{
          [STEPS.SELECT]: selectStep,
          [STEPS.SELECT]: selectStep,
          [STEPS.CONNECT]: connectStep,
          [STEPS.SAVE]: saveStep,
          [STEPS.CONNECTED]: connectedStep,
          ...this.transformSteps(preSteps),
          ...this.transformSteps(postSteps),
        }}
        contentWrapper={contentWrapper}
        defaultStep={step || STEPS.SELECT}
      />
    );
  }
}
