import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { withSelectedJob } from '../../context/SelectedJob';
import JobInfo from '../../../shared/JobInfo';

import ActionBar from './ActionBar';
import ClassificationsPanel from './ClassificationsPanel';
import StatusPanel from './StatusPanel';

class SummaryPanel extends React.PureComponent {
  render() {
    const {
      repoName,
      selectedJob,
      latestClassification,
      bugs,
      jobLogUrls,
      jobDetailLoading,
      logViewerUrl,
      logViewerFullUrl,
      logParseStatus,
      user,
      currentRepo,
      classificationMap,
    } = this.props;

    const logStatus = [
      {
        title: 'Log parsing status',
        value: !jobLogUrls.length
          ? 'No logs'
          : jobLogUrls.map(log => log.parse_status).join(', '),
      },
    ];

    return (
      <div id="summary-panel" role="region" aria-label="Summary">
        <ActionBar
          repoName={repoName}
          logParseStatus={logParseStatus}
          isTryRepo={currentRepo.is_try_repo}
          logViewerUrl={logViewerUrl}
          logViewerFullUrl={logViewerFullUrl}
          jobLogUrls={jobLogUrls}
          user={user}
        />
        <div id="summary-panel-content">
          <div>
            {jobDetailLoading && (
              <div className="overlay">
                <div>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    pulse
                    className="th-spinner-lg"
                  />
                </div>
              </div>
            )}

            <ul className="list-unstyled">
              {latestClassification && (
                <ClassificationsPanel
                  job={selectedJob}
                  classification={latestClassification}
                  classificationMap={classificationMap}
                  bugs={bugs}
                  currentRepo={currentRepo}
                />
              )}
              <StatusPanel />
              <JobInfo job={selectedJob} extraFields={logStatus} />
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

SummaryPanel.propTypes = {
  repoName: PropTypes.string.isRequired,
  bugs: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  currentRepo: PropTypes.object.isRequired,
  classificationMap: PropTypes.object.isRequired,
  selectedJob: PropTypes.object,
  latestClassification: PropTypes.object,
  jobLogUrls: PropTypes.array,
  jobDetailLoading: PropTypes.bool,
  logParseStatus: PropTypes.string,
  logViewerUrl: PropTypes.string,
  logViewerFullUrl: PropTypes.string,
};

SummaryPanel.defaultProps = {
  selectedJob: null,
  latestClassification: null,
  jobLogUrls: [],
  jobDetailLoading: false,
  logParseStatus: 'pending',
  logViewerUrl: null,
  logViewerFullUrl: null,
};

export default withSelectedJob(SummaryPanel);
