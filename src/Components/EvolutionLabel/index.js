// @flow
import * as React from 'react';
import CountUp from 'react-countup';

import { ArrowUp, ArrowDown } from 'Pages/KeywordsTable/Icon/Icons';

// import './evolution-label.scss';

type Props = {
  evolution: number,
  reverseEvolution?: boolean,
  duration: number,
  decimals: number,
  suffix: string | false,
  inactive?: boolean,
};

const EvolutionLabel = (props: Props) => {
  const { evolution, reverseEvolution, duration, decimals, suffix, inactive } = props;
  const evoColor =
    evolution && ((evolution > 0 && !reverseEvolution) || (evolution < 0 && reverseEvolution))
      ? 'green'
      : 'red';

  return (
    <div className={`Kpi-evolution ${inactive ? 'inactive' : evoColor}`}>
      {evolution > 0 ? <ArrowUp /> : <ArrowDown />}
      <CountUp
        start={0}
        end={evolution < 0 ? evolution * -1 : evolution}
        duration={duration}
        decimals={decimals}
        suffix={suffix}
      />
    </div>
  );
};

EvolutionLabel.defaultProps = {
  duration: 1,
  decimals: 1,
  suffix: '%',
};

export default EvolutionLabel;
