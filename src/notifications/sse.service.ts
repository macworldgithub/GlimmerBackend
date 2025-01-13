import { Controller, Query, Sse } from "@nestjs/common";
import { Observable, Subject } from "rxjs";

@Controller("event")
export class SSE {
    public static store_connections = new Map<string, Subject<any>>();

    @Sse('store/sse')
    sse(@Query("store_id") store_id: string): Observable<MessageEvent> {
        if (!store_id) {
            throw new Error('Store Id is required');
        }

        if (!SSE.store_connections.has(store_id)) {
            SSE.store_connections.set(store_id, new Subject<MessageEvent>());
        }
        const store_subject = SSE.store_connections.get(store_id);

        return store_subject?.asObservable() as Observable<any>
    }


    public static send_notification_to_store(
        store_id: string,
        data: any,
    ): void {
        if (!store_id) {
            throw new Error('Vendor ID is required');
        }

        const vendorSubject = SSE.store_connections.get(store_id);

        if (vendorSubject) {
            vendorSubject.next({ data });
        } else {
            console.log(`No active connection for vendor: ${store_id}`);
        }
    }

}
