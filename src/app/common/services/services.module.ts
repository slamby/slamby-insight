import { StatusService } from './status.service';
import { ServicesService } from './services.service';
import { Messenger } from './messenger.service';
import { OptionService } from './option.service';
import { ToasterNotificationService } from './toaster.notification.service';
import { NotificationService } from './notification.service';
import { MaintenanceService } from './maintenance.service';

export const SERVICE_PROVIDERS: any[] = [
    StatusService,
    ServicesService,
    Messenger,
    ToasterNotificationService,
    NotificationService,
    OptionService,
    MaintenanceService
];
