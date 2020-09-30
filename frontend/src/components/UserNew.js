import { connect, useDispatch } from "react-redux";
import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import Button from '@material-ui/core/Button';
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Paper from '@material-ui/core/Paper';
import ClientIDIcon from "@material-ui/icons/Fingerprint";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import PasswordIcon from "@material-ui/icons/VpnKey";
import UserIcon from "@material-ui/icons/Person";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import AccountCircle from "@material-ui/icons/AccountCircle";
import SaveIcon from '@material-ui/icons/Save';
import InputAdornment from "@material-ui/core/InputAdornment";
import { Link as RouterLink } from "react-router-dom";
import { WebSocketContext } from '../websockets/WebSocket';
import { updateUser, updateUsers } from '../actions/actions';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
		  margin: theme.spacing(1),
		},
		'& .MuiTextField-root': {
		  margin: theme.spacing(1),
		  width: '75ch',
		},
	  },
	  buttons: {
		'& > *': {
			margin: theme.spacing(1),
		  },
	  },
  form: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    // marginLeft: theme.spacing(1),
    // marginRight: theme.spacing(1),
    // width: 200,
  },
  margin: {
    margin: theme.spacing(2),
  },
  breadcrumbItem: theme.palette.breadcrumbItem,
  breadcrumbLink: theme.palette.breadcrumbLink,
}));

const UserNew = (props) => {
  const classes = useStyles();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientID, setClientID] = useState('');
  const [textName, setTextName] = useState('');
  const [textDescription, setTextDescription] = useState('');

  const context = useContext(WebSocketContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const { client } = context;

  const onSaveUser = async () => {
	await client.addUser(username, password, clientID, "", textName, textDescription);
	const users = await client.listUsers();
	dispatch(updateUsers(users));
	history.push(`/security/users`);
  }

  const onCancel = () => {
	history.goBack();
  }

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink className={classes.breadcrumbLink} to="/">Home</RouterLink>
        <RouterLink className={classes.breadcrumbLink} to="/security">Security</RouterLink>
        <Typography className={classes.breadcrumbItem} color="textPrimary">Users</Typography>
      </Breadcrumbs>
      <br />
    <div className={classes.root}>
		<Paper>
	<form className={classes.form} noValidate autoComplete="off">
          <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
              <Grid item xs={12}>
                <TextField
                  required
                  id="client-id"
                  label="Client ID"
				  onChange={(event) => setClientID(event.target.value)}
                  defaultValue=""
                  variant="outlined"
				  fullWidth
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ClientIDIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="username"
				  label="Username"
				  onChange={(event) => setUsername(event.target.value)}
                  defaultValue=""
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="password"
                  label="Password"
				  onChange={(event) => setPassword(event.target.value)}
                  defaultValue=""
                  variant="outlined"
				  fullWidth
                  type="password"
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
					  	<PasswordIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="textname"
				  label="Text name"
				  onChange={(event) => setTextName(event.target.value)}
                  defaultValue=""
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="textdescription"
				  label="Text description"
				  onChange={(event) => setTextDescription(event.target.value)}
                  defaultValue=""
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid container xs={12} alignItems="flex-start">
              <Grid item xs={12} className={classes.buttons} >
				<Button
					variant="contained"
					color="primary"
					className={classes.button}
					startIcon={<SaveIcon />}
					onClick={(event) => {
					  event.stopPropagation();
					  onSaveUser();
					}}
				>
					Save
				</Button>
				<Button
					variant="contained"
					onClick={(event) => {
					  event.stopPropagation();
					  onCancel();
					}}
				>
					Cancel
				</Button>
				</Grid>
              </Grid>
            </Grid>
          </div>
        </form>
		</Paper>
		</div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
  };
};

export default connect(mapStateToProps)(UserNew);