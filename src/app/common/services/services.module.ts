import { DocumentService } from './document.service';
import { DatasetService } from './dataset.service';
import { TagService } from './tag.service';
import { StatusService } from './status.service';
import { ServicesService } from './services.service';
import { ClassifierServicesService } from './classifier.services.service';
import { PrcServicesService } from './prc.services.service';
import { ProcessesService } from './processes.service';
import { Messenger } from './messenger.service';
import { OptionService } from './option.service';
import { ToasterNotificationService } from './toaster.notification.service';
import { NotificationService } from './notification.service';

export const SERVICE_PROVIDERS: any[] = [
    DatasetService,
    DocumentService,
    StatusService,
    ServicesService,
    ProcessesService,
    ClassifierServicesService,
    PrcServicesService,
    TagService,
    Messenger,
    ToasterNotificationService,
    NotificationService,
    OptionService,
];
