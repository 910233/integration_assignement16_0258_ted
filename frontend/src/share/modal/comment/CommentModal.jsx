import { Box, Button, Card, Modal, TextField } from '@mui/material';
import React, { useState, useEffect, useContext } from 'react';
import { useKeyDown } from '../../../hooks/useKeyDown';
import { useQuery, useMutation, QueryClient, useQueryClient } from 'react-query';
import GlobalContext from '../../context/GlobalContext';
import Cookies from 'js-cookie';
import Axios from '../../AxiosInstance';
import { AxiosError } from 'axios';

const CommentModal = ({ open = false, handleClose = () => {} }) => {
  const [textField, setTextField] = useState('');

  const { user, setStatus, comments, setComments } = useContext(GlobalContext);
  const [startFetch, setStartFetch] = useState(false);
  const queryClient = useQueryClient()

  const fetchComments = async () => {
    const userToken = Cookies.get('UserToken');
    return await Axios.get('/comment', {
      headers: { 
        Authorization: `Bearer ${userToken}`,
      },
    });
  };

  useEffect(() => {
    const userToken = Cookies.get('UserToken');
    setStartFetch(!(userToken == null || userToken == 'undefined'));
  }, [user]);

  useQuery('comment', fetchComments, {
    onSuccess: (data) => {
      setComments(data.data.data);
    },
    enabled: startFetch,
  })

  useKeyDown(() => {
    handleAddComment();
  }, ['Enter']);

  const handleAddComment = () => {
    // TODO implement logic
    commentMutation.mutate();
  }
  
  const commentMutation = useMutation(() => 
    Axios.post('/comment', 
    { 
     text: textField,
    }, 
    {
      headers: { Authorization: `Bearer ${Cookies.get('UserToken')}` }
    }),
    {
      onSuccess: (data) =>{
        if(data.data.success){
          queryClient.invalidateQueries();
          setStatus({ severity: 'success', msg: 'Create comment successfully'});
          setComments((prev) => [...prev, data.data]);
          setTextField('');
        }
      },
      onError: (error) => {
        setTextField('');
        if(error instanceof AxiosError)
          if(error.response)
            return setStatus({
              msg: error.response.data.error,
              severity: 'error',
            });
        return setStatus({
          msg: error.message,
          severity: 'error',
        });
      },
    }
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <Card
        sx={{
          width: { xs: '60vw', lg: '40vw' },
          maxWidth: '600px',
          maxHeight: '400px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '16px',
          backgroundColor: '#ffffffCC',
          p: '2rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <TextField
            value={textField}
            onChange={(e) => setTextField(e.target.value)}
            fullWidth
            placeholder="Type your comment"
            variant="standard"
          />
          <Button onClick={handleAddComment}>Submit</Button>
        </Box>
        <Box sx={{ overflowY: 'scroll', maxHeight: 'calc(400px - 2rem)' }}>
          {comments.map((comment) => (
            <Card key={comment.id} sx={{ p: '1rem', m: '0.5rem' }}>
              {comment.text}
            </Card>
          ))}
        </Box>
      </Card>
    </Modal>
  );
};

export default CommentModal;
