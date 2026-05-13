import Title from "@/app/components/ui/Typography/Title/Title"
import styles from "./page.module.css"
import NotificationBox from "@/app/components/ui/NotificationBox/NotificationBox"
import { getServerCtx } from "@/lib/auth/ctx"
import { getOptionalAuth } from "@/lib/auth/auth"
import { notFound } from "next/navigation"
import { getUserNotifications } from "@/lib/db/notifications"

export const dynamic = "force-dynamic"

export default async function Page() {
    const ctx = await getServerCtx()
    const auth = getOptionalAuth(ctx)

    if (auth.userId === null) {
        notFound()
    }

    const notifications = await getUserNotifications({ user_id: auth.userId })

    return <>
        <div className={styles.pageContainer}>
            <Title text="Notifiche" alignment="left" hierarchy={1} />
            <div className={styles.notificationsContainer}>
                {notifications.length > 0 ? notifications.map((notification) => (
                    <NotificationBox
                        key={notification.id}
                        notificationId={notification.id}
                        title={notification.title}
                        content={notification.text}
                        isRead={notification.is_read}
                    />
                )) : (
                    <p className={styles.emptyNotificationsText}>Nessuna notifica al momento.</p>
                )}
            </div>
        </div>
    </>
}