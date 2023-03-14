import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import ContainerHeader from '../../../components/ContainerHeader';
import SelectList from '../../../components/SelectList';
import {useFormStyles} from '../../../styles';
import {WebSocketContext} from '../../../websockets/WebSocket';
import {updateUser, updateUsers} from '../actions/actions';


const PASSWORD_ERROR_MESSAGE = 'Password should not be empty';

const userShape = PropTypes.shape({
	username: PropTypes.string,
	roles: PropTypes.array
});

const UserDetail = (props) => {
	const [value, setValue] = React.useState(0);
	const [editMode, setEditMode] = React.useState(false);
	const {enqueueSnackbar} = useSnackbar();
	const ref = React.useRef();
	const [passwordError, setPasswordError] = React.useState(null);
	const formClasses = useFormStyles();

	React.useEffect(() => {
		if (document.hasFocus() && ref.current?.contains(document.activeElement)) {
			if (!ref.current.value) {
				setPasswordError(PASSWORD_ERROR_MESSAGE);
			}
		}
	}, []);

	const {user, userRoles = [], backendParameters} = props;
	if (user) {
		user.password = null;
	}
	const [updatedUser, setUpdatedUser] = React.useState({
		...user,
	});

	const roleSuggestions = userRoles
		.sort()
		.map((rolename) => ({
			label: rolename,
			value: rolename
		}));

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const {client: brokerClient} = context;

	const validate = () => {
		if (passwordError) {
			return false;
		}
		if (editMode) {
			return updatedUser.username !== '';
		}
	};

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const onUpdateUserDetail = async () => {
		if (backendParameters.ssoUsed) {
			updatedUser.password = undefined;
		}
		try {
			await brokerClient.updateUser(updatedUser);
			enqueueSnackbar('User successfully updated', {
				variant: 'success'
			})
		} catch (error) {
			enqueueSnackbar(`Error updating user "${updatedUser.username}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
		const userObject = await brokerClient.getUser(updatedUser.username);
		dispatch(updateUser(userObject));
		const users = await brokerClient.listUsers();
		dispatch(updateUsers(users));
		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel user editing',
			description: `Do you really want to cancel editing this user?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedUser({
			...user
		});
		setEditMode(false);
	};

	return user ? (<div>
		<ContainerBreadCrumbs title={user.username} links={[{name: 'Home', route: '/home'},
			{name: 'Users', route: '/users'}
		]}/>
		<ContainerHeader
			title={`Edit User: ${user.username}`}
			subTitle="Edit User properties"
		/>
		<Grid container spacing={1} alignItems="flex-end">
			<Grid item xs={12}>
				<TextField
					required={editMode}
					disabled={true}
					id="username"
					label="Name"
					value={updatedUser?.username}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="dense"
					className={formClasses.textField}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<AccountCircle/>
							</InputAdornment>
						)
					}}
				/>
			</Grid>
			{backendParameters.ssoUsed ?
				null
				:
				<>
					<Grid item xs={12}>
						<TextField
							disabled={!editMode}
							required
							id="password"
							label="Password (empty password will be ignored)"
							helperText={passwordError}
							value={updatedUser?.password}
							defaultValue=""
							variant="outlined"
							fullWidth
							type="password"
							className={formClasses.textField}
							size="small"
							margin="dense"
							onChange={(event) => {
								if (event.target.value) {
									setPasswordError(null);
								} else {
									setPasswordError(PASSWORD_ERROR_MESSAGE);
								}
								if (editMode) {
									setUpdatedUser({
										...updatedUser,
										password: event.target.value
									});
								}
							}}
							error={!!passwordError}
							onFocus={() => {
								if (!updatedUser?.password) {
									setPasswordError(PASSWORD_ERROR_MESSAGE);
								}
							}}
							onBlur={() => {
								setPasswordError(null);
							}}
							inputRef={ref}
						/>
					</Grid>
				</>
			}
			<Grid item xs={12} style={{paddingTop: '10px'}}>
				<SelectList
					variant="outlined"
					label="Roles"
					className={formClasses.autoComplete}
					values={updatedUser?.roles}
					getValue={value => value}
					onChange={(event, value) => {
						if (editMode) {
							if (!value) {
								value = [];
							}
							setUpdatedUser({
								...updatedUser,
								roles: value.map((role) => role.value)
							});
						}
					}}
					disabled={!editMode}
					suggestions={roleSuggestions}
				/>
			</Grid>
		</Grid>
		{!editMode && (
			<Grid item xs={12}>
				<Button
					disabled={updatedUser.editable === false}
					variant="contained"
					className={formClasses.buttonTop}
					size="small"
					color="primary"
					startIcon={<EditIcon/>}
					onClick={() => setEditMode(true)}
				>
					Edit
				</Button>
			</Grid>
		)}
		{editMode && (
			<Grid item xs={12}>
				<Button
					variant="contained"
					disabled={!validate()}
					size="small"
					color="primary"
					className={formClasses.buttonTopRight}
					startIcon={<SaveIcon/>}
					onClick={(event) => {
						event.stopPropagation();
						onUpdateUserDetail();
					}}
				>
					Save
				</Button>
				<Button
					variant="contained"
					size="small"
					className={formClasses.buttonTop}
					onClick={(event) => {
						event.stopPropagation();
						onCancelEdit();
					}}
				>
					Cancel
				</Button>
			</Grid>
		)}
	</div>) : null;
};

UserDetail.propTypes = {
	user: userShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		user: state.users?.user,
		userRoles: state.userRoles?.userRoles,
		backendParameters: state.backendParameters?.backendParameters,
	};
};

export default connect(mapStateToProps)(UserDetail);
