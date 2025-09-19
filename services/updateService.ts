import { useCallback } from 'react';
import { checkAndInstallUpdate } from '../utils/updateManager';

interface UseUpdateServiceParams {
  setUpdateInfoStatus: React.Dispatch<React.SetStateAction<'success' | 'fail' | 'unchanged'>>;
  setUpdateBuildInfo: React.Dispatch<React.SetStateAction<any>>;
  setIsUpdateInfoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useUpdateService = ({
  setUpdateInfoStatus,
  setUpdateBuildInfo,
  setIsUpdateInfoModalOpen,
}: UseUpdateServiceParams) => {
  const handleUpdate = useCallback(async () => {
    try {
      const result = await checkAndInstallUpdate();

      setUpdateInfoStatus(result.status);
      setUpdateBuildInfo(result.buildInfo || null);
      setIsUpdateInfoModalOpen(true);

    } catch (error) {
      console.error('Update check failed:', error);
      setUpdateInfoStatus('fail');
      setUpdateBuildInfo(null);
      setIsUpdateInfoModalOpen(true);
    }
  }, [setUpdateInfoStatus, setUpdateBuildInfo, setIsUpdateInfoModalOpen]);

  return {
    handleUpdate,
  };
};
