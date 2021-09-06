import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

function Heading({ children }) {
  return (
    <Box mb={2}>
      <Typography variant="h5">{children}</Typography>
    </Box>
  );
}

export default Heading;
