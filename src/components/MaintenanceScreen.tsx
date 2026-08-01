import { siteConfig } from '@/config/site'

export function MaintenanceScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center">
      <img
        src="/gsc_logo.svg"
        alt={siteConfig.schoolName}
        className="h-16 w-16"
      />
      <h1 className="mt-6 text-2xl font-extrabold text-white sm:text-3xl">
        {siteConfig.orgShortName} is down for maintenance
      </h1>
      <p className="mt-3 max-w-md text-[15px] text-navy-100/75">{message}</p>
    </div>
  )
}