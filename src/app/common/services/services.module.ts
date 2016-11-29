import { StatusService } from './status.service';
import { ServicesService } from './services.service';
import { Messenger } from './messenger.service';
import { OptionService } from './option.service';
import { ToasterNotificationService } from './toaster.notification.service';
import { NotificationService } from './notification.service';
import { MaintenanceService } from './maintenance.service';
import { LicenseService } from './license.service';
import { UpdaterService } from './updater.service';

export { StatusService } from './status.service';
export { ServicesService } from './services.service';
export { Messenger } from './messenger.service';
export { OptionService } from './option.service';
export { ToasterNotificationService } from './toaster.notification.service';
export { NotificationService } from './notification.service';
export { MaintenanceService } from './maintenance.service';
export { LicenseService } from './license.service';
export { UpdaterService, IUpdaterResult } from './updater.service';

export const SERVICE_PROVIDERS: any[] = [
    StatusService,
    ServicesService,
    Messenger,
    ToasterNotificationService,
    NotificationService,
    OptionService,
    MaintenanceService,
    LicenseService,
    UpdaterService
];
