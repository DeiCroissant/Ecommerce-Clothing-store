import { 
  FileText, 
  CheckCircle, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { formatDateTime } from '@/lib/mockOrdersData';

const ICON_MAP = {
  FileText,
  CheckCircle,
  Package,
  Truck,
  CheckCircle2,
  XCircle
};

export function ReturnDetailTimeline({ timeline, currentStatus }) {
  const getIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName] || Package;
    return <IconComponent size={20} />;
  };

  const isStepActive = (step, index) => {
    return index <= timeline.length - 1;
  };

  const isCurrentStep = (step) => {
    return step.status === currentStatus;
  };

  return (
    <div className="return-timeline-container">
      <h3 className="timeline-title">Trạng Thái Trả Hàng</h3>
      
      <div className="timeline">
        {timeline.map((step, index) => (
          <div 
            key={index} 
            className={`timeline-item ${isCurrentStep(step) ? 'current' : ''} ${isStepActive(step, index) ? 'active' : ''}`}
          >
            <div className="timeline-marker">
              <div className={`timeline-icon timeline-${step.status}`}>
                {getIcon(step.icon)}
              </div>
              {index < timeline.length - 1 && (
                <div className={`timeline-line ${isStepActive(step, index) ? 'active' : ''}`} />
              )}
            </div>
            
            <div className="timeline-content">
              <div className="timeline-header">
                <h4 className="timeline-label">{step.label}</h4>
                <time className="timeline-time">
                  {formatDateTime(step.timestamp)}
                </time>
              </div>
              <p className="timeline-description">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
