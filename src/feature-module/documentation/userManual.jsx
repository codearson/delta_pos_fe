import React from 'react';
import { Download, ChevronUp, FileText, ExternalLink } from 'react-feather';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setToogleHeader } from '../../core/redux/action';
import '../../style/scss/pages/_userManual.scss';

// On mobile/tablet, inline PDF rendering is unreliable — show buttons instead.
const isMobileOrTablet = () =>
  /iPad|iPhone|iPod|Android|Mobile|Tablet/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
  window.innerWidth < 1024;

const PDF_URL = '/User_Manual.pdf';

const UserManual = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const iosDevice = isMobileOrTablet();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = PDF_URL;
    link.download = 'User_Manual.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCollapseTooltip = (props) => (
    <Tooltip id="collapse-tooltip" {...props}>Collapse</Tooltip>
  );

  const renderDownloadTooltip = (props) => (
    <Tooltip id="download-tooltip" {...props}>Download PDF</Tooltip>
  );

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>User Manual V 1.0</h4>
            <h6>View and download user manual</h6>
          </div>
          <ul className="table-top-head">
            <li>
              <OverlayTrigger placement="top" overlay={renderDownloadTooltip}>
                <Link onClick={handleDownload}>
                  <Download />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  className={data ? "active" : ""}
                  onClick={() => { dispatch(setToogleHeader(!data)) }}
                >
                  <ChevronUp />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        <div className="card table-list-card">
          <div className="card-body p-0">
            <div className={`pdf-container ${data ? 'header-collapsed' : ''}`}>
              {iosDevice ? (
                /* iOS Safari cannot render PDFs inside iframes/embeds.
                   Show a full-height tap-to-open card instead. */
                <div className="pdf-ios-fallback">
                  <FileText size={56} strokeWidth={1.2} />
                  <h5>User Manual PDF</h5>
                  <p>PDF preview is not available on mobile &amp; tablet.<br />Use a button below to continue.</p>
                  <div className="pdf-ios-actions">
                    <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      <ExternalLink size={16} className="me-2" />
                      Open PDF
                    </a>
                    <button onClick={handleDownload} className="btn btn-outline-secondary">
                      <Download size={16} className="me-2" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  src={PDF_URL}
                  title="User Manual PDF"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;