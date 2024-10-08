import { supabase } from "../../lib/supabase.js";

export const registerUser = async (c) => {
  const { email, password } = await c.req.json();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    return c.json({ message: 'Registration successful', user: data.user });
  } catch (error) {
    return c.json({ message: 'Error during registration', error: error.message }, 500);
  }
};

export const loginUser = async (c) => {
  const { email, password } = await c.req.json();

  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw new Error(signInError.message);

    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error(userError);
      return c.json({ message: 'Error fetching user data: ' + userError.message }, 500);
    }

    if (!userData) {
      const { error: insertError } = await supabase.from('user').insert([{ email }]);

      if (insertError) {
        console.error(insertError);
        return c.json({ message: 'Error inserting user: ' + insertError.message }, 500);
      }
    }

    return c.json({ message: 'Login successful', user: data.user });
  } catch (error) {
    return c.json({ message: 'Error during login', error: error.message }, 500);
  }
};

export const  signOutUser = async (c) => {
  try {
    const {error} = await supabase.auth.signOut()

    if(error) throw new Error(error.message);
    return c.json({message: 'Log out successful'}, 200);
  } catch( error) {
    return c.json({message: 'Error During Log out', error: error.message}, 500);
  }
}

export const requestPasswordReset = async (c) => {
  const { email } = await c.req.json();

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://form-smkn7-fe.vercel.app/reset',
    });

    if (error) throw new Error(error.message);

    return c.json({ message: 'Password reset email sent' });
  } catch (error) {
    return c.json({ message: 'Error during password reset request', error: error.message }, 500);
  }
};

export const resetPassword = async (c) => {
  const { newPassword, accessToken } = await c.req.json();

  try {
    const { error } = await supabase.auth.updateUser(accessToken, {
      password: newPassword,
    });

    if (error) throw new Error(error.message);

    return c.json({ message: 'Password reset successful' });
  } catch (error) {
    return c.json({ message: 'Error during password reset', error: error.message }, 500);
  }
};