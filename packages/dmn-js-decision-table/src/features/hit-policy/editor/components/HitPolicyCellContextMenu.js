import { Component } from 'inferno';

import InputSelect from 'dmn-js-shared/lib/components/InputSelect';

const HIT_POLICIES = [
  'UNIQUE',
  'FIRST',
  'PRIORITY',
  'ANY',
  'COLLECT',
  'RULE ORDER',
  'OUTPUT ORDER'
];

const LIST_FUNCTIONS = [
  'LIST',
  'SUM',
  'MIN',
  'MAX',
  'COUNT'
];

const EMPTY_AGGREGATIONS = [
  '',
  'LIST'
];


export default class HitPolicyCellContextMenu extends Component {

  constructor(props, context) {
    super(props, context);

    const {
      changeSupport,
      injector
    } = context;

    this._changeSupport = changeSupport;
    this._modeling = injector.get('modeling');

    const sheet = this._sheet = injector.get('sheet');
    const root = sheet.getRoot(),
          businessObject = root.businessObject,
          hitPolicy = businessObject.hitPolicy,
          aggregation = businessObject.aggregation || 'LIST';

    this.state = {
      hitPolicy,
      aggregation
    };

    this.onHitPolicyChange = this.onHitPolicyChange.bind(this);
    this.onAggregationChange = this.onAggregationChange.bind(this);
    this.onElementsChanged = this.onElementsChanged.bind(this);
  }

  onHitPolicyChange(hitPolicy) {
    const root = this._sheet.getRoot(),
          businessObject = root.businessObject;

    const aggregation = hitPolicy === 'COLLECT' ? businessObject.aggregation : undefined;

    this._modeling.editHitPolicy(hitPolicy, aggregation);
  }

  onAggregationChange(value) {
    const aggregation = EMPTY_AGGREGATIONS.includes(value)
      ? undefined
      : value;

    this._modeling.editHitPolicy('COLLECT', aggregation);
  }

  onElementsChanged() {
    const root = this._sheet.getRoot(),
          businessObject = root.businessObject,
          hitPolicy = businessObject.hitPolicy;

    let aggregation;

    if (hitPolicy === 'COLLECT') {
      aggregation = businessObject.aggregation;

      if (!aggregation && EMPTY_AGGREGATIONS.includes(this.state.aggregation)) {
        aggregation = this.state.aggregation;
      }
    }

    this.setState({
      aggregation,
      hitPolicy
    });
  }

  componentDidMount() {
    const root = this._sheet.getRoot();

    this._changeSupport.onElementsChanged(root.id, this.onElementsChanged);
  }

  componentWillUnmount() {
    const root = this._sheet.getRoot();

    this._changeSupport.offElementsChanged(root.id, this.onElementsChanged);
  }

  render() {
    const {
      aggregation,
      hitPolicy
    } = this.state;

    const hitPolicyOptions = HIT_POLICIES.map(h => {
      return {
        label: h,
        value: h
      };
    });

    const aggregationOptions = LIST_FUNCTIONS.map(l => {
      return {
        label: l,
        value: l
      };
    });

    return (
      <div className="context-menu-container hit-policy-edit">
        <p className="hit-policy-edit-policy">
          <label className="dms-label">Hit Policy:</label>

          <InputSelect
            className="hit-policy-edit-policy-select"
            onChange={ this.onHitPolicyChange }
            options={ hitPolicyOptions }
            value={ hitPolicy } />
        </p>
        {
          hitPolicy === 'COLLECT' &&
            <p className="hit-policy-edit-operator">
              <label className="dms-label">Aggregation:</label>

              <InputSelect
                className="hit-policy-edit-operator-select"
                onChange={ this.onAggregationChange }
                options={ aggregationOptions }
                value={ aggregation } />
            </p>
        }
      </div>
    );
  }
}