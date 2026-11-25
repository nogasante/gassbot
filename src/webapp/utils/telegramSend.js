export async function sendResourceToTelegram(resource) {
  const tg = window.Telegram?.WebApp;
  const userId = tg?.initDataUnsafe?.user?.id;

  const notify = (msg) => {
    if (tg?.showAlert) {
      tg.showAlert(msg);
    } else {
      window.alert(msg);
    }
  };

  if (!userId) {
    if (resource.file_url) {
      window.open(resource.file_url, '_blank', 'noreferrer');
    } else {
      notify('Open this Mini App inside Telegram to receive files directly in chat.');
    }
    return;
  }

  try {
    const response = await fetch(`/api/resources/${resource.id}/send-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    if (data.delivered) {
      notify(`Sent "${resource.title}" to your Telegram chat!`);
    } else if (resource.file_url) {
      if (tg?.openLink) {
        tg.openLink(resource.file_url);
      } else {
        window.open(resource.file_url, '_blank', 'noreferrer');
      }
    } else {
      notify(data.message || 'Could not deliver this file.');
    }
  } catch (err) {
    console.error('sendResourceToTelegram failed:', err);
    if (resource.file_url) {
      window.open(resource.file_url, '_blank', 'noreferrer');
    }
  }
}
