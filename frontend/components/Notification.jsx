import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faInfoCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return faCheckCircle;
    case 'warning':
      return faExclamationTriangle;
    case 'info':
      return faInfoCircle;
    default:
      return faInfoCircle;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'success':
      return 'bg-success';
    case 'warning':
      return 'bg-warning';
    case 'info':
      return 'bg-info';
    default:
      return 'bg-gray-200';
  }
};

export default function Notification({ notification }) {
  return (
    <div 
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
        notification.read ? 'bg-gray-50' : 'bg-white'
      }`}
    >
      <div className="flex items-start">
        <div 
          className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 ${
            getNotificationColor(notification.type)
          }`}
        >
          <FontAwesomeIcon 
            icon={getNotificationIcon(notification.type)} 
            className="w-5 h-5 text-white"
          />
        </div>
        <div>
          <h4 className="font-medium text-text-primary">{notification.title}</h4>
          <p className="text-text-secondary text-sm break-words">{notification.message}</p>
          <p className="text-xs text-text-secondary mt-1">
            {new Date(notification.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}