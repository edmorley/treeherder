import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

import perf from '../js/perf';
import { errorMessageClass } from '../helpers/constants';
import ErrorBoundary from '../shared/ErrorBoundary';
import Graph from '../shared/Graph';
import PerfSeriesModel from '../models/perfSeries';
import { getData } from '../helpers/http';
import { createApiUrl, perfSummaryEndpoint } from '../helpers/url';

// TODO remove $stateParams after switching to react router
export default class ReplicatesGraph extends React.Component {
  // TODO: sync parent with children IRT dataLoading
  constructor(props) {
    super(props);

    this.state = { dataLoading: true };
  }

  async componentDidMount() {
    this.syncGraphData();
  }

  syncGraphData = async () => {
    const { title } = this.props;

    const { replicateData, drawingData } = await this.fetchReplicateGraphData();
    const { replicateDataError } = replicateData;
    const numRuns = drawingData ? drawingData.numRuns : 0;

    return this.setState({
      drawingData,
      graphSpecs: this.getGraphSpecs(title, numRuns, replicateDataError),
      dataLoading: false,
    });
  };

  getGraphSpecs = (title, numRuns, error = false) =>
    !error
      ? {
          target: '',
          data: [],
          width: 1000,
          height: 275,
          chart_type: 'bar',
          x_accessor: 'replicate',
          y_accessor: 'value',
          legend: '',
          title: `${title} replicates over ${numRuns} run${
            numRuns > 1 ? 's' : ''
          }`,
        }
      : {
          target: '',
          title: `${title} replicates`,
          chart_type: 'missing-data',
          missing_text: 'No Data Found',
          width: 1000,
          height: 275,
        };

  fetchReplicateGraphData = async () => {
    const { projectName, revision, subtestSignature } = this.props;
    const replicateData = {};

    const perfDatumResponse = await getData(
      createApiUrl(perfSummaryEndpoint, {
        revision,
        repository: projectName,
        signature: subtestSignature,
      }),
    );
    const perfDatum = perfDatumResponse.data[0];

    if (!perfDatum.values.length) {
      replicateData.replicateDataError = true;
      return { replicateData };
    }
    const numRuns = perfDatum.values.length;
    const replicatePromises = perfDatum.job_ids.map(job_id =>
      PerfSeriesModel.getReplicateData({ job_id }),
    );

    return Promise.all(replicatePromises).then(
      localReplicateData => {
        let replicateValues = localReplicateData.concat.apply(
          [],
          localReplicateData.map(data => {
            const testSuite = data.suites.find(
              suite => suite.name === this.props.filters.testSuite,
            );
            const subtest = testSuite.subtests.find(
              subtest => subtest.name === this.props.filters.subtest,
            );
            return subtest.replicates;
          }),
        );
        // metrics-graphics doesn't accept "0" as x_accesor
        replicateValues = replicateValues.map((value, index) => ({
          replicate: (index + 1).toString(),
          value,
        }));

        return {
          replicateData,
          drawingData: { numRuns, replicateValues },
        };
      },
      () => {
        replicateData.replicateDataError = true;
        return { replicateData };
      },
    );
  };

  render() {
    const { graphSpecs, drawingData, dataLoading } = this.state;
    const { title } = this.props;
    const data =
      drawingData && drawingData.replicateValues
        ? drawingData.replicateValues
        : undefined;

    return dataLoading ? (
      <div className="loading">
        Loading {title.toLowerCase()} results, please wait a minute...
        <FontAwesomeIcon icon={faCog} size="4x" spin />
      </div>
    ) : (
      <ErrorBoundary
        errorClasses={errorMessageClass}
        message="Failed to display replicates graph"
      >
        <Graph specs={graphSpecs} data={data} />
      </ErrorBoundary>
    );
  }
}

ReplicatesGraph.propTypes = {
  title: PropTypes.string.isRequired, // TODO: stands for targetId
  projectName: PropTypes.string.isRequired,
  revision: PropTypes.string.isRequired,
  subtestSignature: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    testSuite: PropTypes.string.isRequired,
    subtest: PropTypes.string.isRequired,
  }).isRequired,
};

perf.component('replicatesGraph', react2angular(ReplicatesGraph, [], []));
