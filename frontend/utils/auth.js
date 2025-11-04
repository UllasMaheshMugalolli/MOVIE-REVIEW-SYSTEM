// Utility function to check if user is admin
export const isUserAdmin = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.is_admin === true;
  } catch (e) {
    return false;
  }
};

// Utility function to get user info from token
export const getUserInfo = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      user_id: payload.user_id,
      username: payload.username,
      is_admin: payload.is_admin || false
    };
  } catch (e) {
    return null;
  }
};
