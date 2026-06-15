export function getDeviceId(): string {
  let id = localStorage.getItem('flect_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('flect_device_id', id);
  }
  return id;
}
