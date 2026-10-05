import { useAuth } from '../../context/authContext';
import './dataStatus.css';

export function DataStatus() {
    const { isLocalMode, dataError, retryData, loadingData } = useAuth();
    return <>
        {isLocalMode && <div className="data-status" role="status"><span className="data-status__label">LOCAL GARDEN</span><span className="data-status__message">Plants saved in this browser · Separate from your account collection</span></div>}
        {dataError && <div className="data-status data-status--error" role="alert"><span className="data-status__message">{dataError}</span><button type="button" onClick={retryData} disabled={loadingData}>{loadingData ? 'Retrying…' : 'Try again'}</button></div>}
    </>;
}
