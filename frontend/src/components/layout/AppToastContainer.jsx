import { useTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';

export default function AppToastContainer() {
    const theme = useTheme();

    return (
        <ToastContainer
            theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
            newestOnTop
            limit={4}
            closeButton
        />
    );
}
