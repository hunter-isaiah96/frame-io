<template>
  <v-container class="d-flex ma-0 pa-0" fluid>
    <div class="login-info pa-7 full-flex">
      <v-card class="fill-height primary d-flex align-center justify-center">
        <div class="d-flex flex-column justify-center">
          <v-icon class="mx-auto display-3">mdi-eye-outline</v-icon>
          <h1 class="display-3">Eye-Approve</h1>
        </div>
      </v-card>
    </div>
    <v-card
      class="transparent d-flex full-flex flex-column align-center justify-center"
    >
      <h2 class="font-weight-light mb-2">Welcome</h2>
      <h4 class="font-weight-light mb-10">
        <span>{{ state.welcome_message }}</span>
      </h4>
      <v-form
        @submit.prevent="authenticate"
        class="login-form"
        ref="form"
        lazy-validation
      >
        <v-text-field
          v-model="auth_form.email"
          label="Email"
          type="email"
          placeholder="example@example.com"
          :disabled="state.email_checked || state.loading_data"
          :rules="rules.emailRules"
        ></v-text-field>
        <v-text-field
          v-model="auth_form.password"
          label="Password"
          type="password"
          placeholder="********"
          v-if="state.email_checked"
          :rules="rules.passwordRules"
          :disabled="state.loading_data"
        ></v-text-field>
        <v-text-field
          v-model="auth_form.confirm_password"
          label="Confirm Password"
          type="password"
          placeholder="********"
          :rules="rules.confirmPasswordRules"
          :disabled="state.loading_data"
          v-if="state.email_checked && !state.email_exists"
        ></v-text-field>
        <v-btn @click="authenticate" :disabled="state.loading_data" :loading="state.loading_data" block large>Let's go</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  reactive,
} from "@nuxtjs/composition-api";
import emailValidator from "email-validator";

export default defineComponent({
  props: {},

  setup() {
    const auth_form = reactive({
      email: "",
      password: "",
      confirm_password: "",
    });

    const rules = reactive({
      emailRules: [
        (value) => !!value || "Required",
        (value) =>
          emailValidator.validate(value) ||
          "Please enter a properly formatted email address...",
      ],
      passwordRules: [(value) => !!value || "Required"],
      confirmPasswordRules: [
        (value) => !!value || "Required",
        (value) => auth_form.password == value || "Passwords must match",
      ],
    });

    const state = reactive({
      email_checked: false,
      email_exists: false,
      loading_data: false,
      welcome_message: "",
    });

    const setAuthTokens = () => {
      // this.$store.commit('todos/add', e.target.value)
    }

    const authenticate = async () => {
      if (!emailValidator.validate(auth_form.email)) {
        return;
      }
      state.loading_data = true
      if (state.email_checked && state.email_exists) {
        // Login
        try {
          const response = await fetch(`/api/auth`, {
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(auth_form),
          });
          const result = await response.json();
          if (result.success) {
            document.cookie = `access_token=${result.access_token}`
            localStorage.setItem('refresh_token', result.refresh_token)
            alert("Successful Login");
          }
        } catch (e) {
          console.log(e);
        } finally {
          state.loading_data = false
        }
      } else if (state.email_checked) {
        // Register
        try {
          const response = await fetch(`/api/auth/new`, {
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(auth_form),
          });
          const result = await response.json();
          if (result.success) {
            localStorage.setItem('token', result.token)
            alert("Successful Registration");
          } 
        } catch (e) {
          console.log(e);
        } finally {
          state.loading_data = false
        }
      } else {
        try {
          const response = await fetch(
            `/api/auth/checkemail?email=${auth_form.email}`
          );
          const result = await response.json();
          if(result.success) {
            state.email_exists = result.exists;
            state.email_checked = true;
          }
        } catch (err) {
          console.log(err);
        } finally {
          state.loading_data = false
        }
      }

      // if(email_exists)

      // setTimeout(() => {
      //   checking_email.value = false
      //   email_checked.value = true
      // }, 2000)
    };
    return {
      state,
      authenticate,
      auth_form,
      rules,
    };
  },
});
</script>

<style lang="scss" scoped>
.login-info {
  flex: 0.5;
}
.login-form {
  width: 40%;
}
.container {
  height: 100%;
  overflow: hidden;
}
</style>